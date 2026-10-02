import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { OAuth2Client } from 'google-auth-library';
import { db } from './server/db.js';
import { sendOrderConfirmationEmail } from './server/mailgun.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const googleAuthClient = new OAuth2Client(googleClientId);

const app = express();
app.use(express.json());

// In-memory session store (simple token -> userId mapping for robust session management)
const sessionTokens = new Map<string, string>();

function getUserIdFromReq(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return sessionTokens.get(token) || null;
  }
  return null;
}

// ---------------- API ROUTES ----------------

// Config
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    appName: 'KOKO MARKET',
    mailgunConfigured: Boolean(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN),
  });
});

// Categories
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await db.getCategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch categories' });
  }
});

// Products
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { category, search, inStock, sort } = req.query;
    const products = await db.getProducts({
      categorySlug: category ? String(category) : undefined,
      search: search ? String(search) : undefined,
      inStockOnly: inStock === 'true',
      sort: sort ? String(sort) : undefined,
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch products' });
  }
});

// Single Product by slug
app.get('/api/products/:slug', async (req: Request, res: Response) => {
  try {
    const product = await db.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch product' });
  }
});

// Orders - Creation
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      deliveryAddress,
      city,
      state,
      country,
      deliveryFee,
      items,
      idempotencyKey,
    } = req.body;

    // Strict validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      return res.status(400).json({ error: 'A valid contact phone number is required' });
    }
    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ error: 'City is required' });
    }
    if (!state || !state.trim()) {
      return res.status(400).json({ error: 'State is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your basket is empty' });
    }

    const userId = getUserIdFromReq(req);

    // Create the order (calculates totals and decreases inventory server-side)
    const order = await db.createOrder({
      user_id: userId,
      customer_name: fullName,
      customer_email: email,
      customer_phone: phoneNumber,
      delivery_address: deliveryAddress,
      delivery_city: city,
      delivery_state: state,
      delivery_country: country || 'Nigeria',
      delivery_fee: Number(deliveryFee) || 2500,
      items,
      idempotency_key: idempotencyKey,
    });

    // Send Mailgun confirmation email
    const emailResult = await sendOrderConfirmationEmail(order);
    order.mailgun_status = emailResult.status;
    order.email_preview = emailResult.preview;

    res.status(201).json({
      success: true,
      order,
      mailgunStatus: emailResult.status,
    });
  } catch (err: any) {
    console.error('[API /api/orders] Error creating order:', err.message);
    res.status(400).json({ error: err.message || 'Failed to complete order' });
  }
});

// Single Order Lookup
app.get('/api/orders/by-number/:orderNumber', async (req: Request, res: Response) => {
  try {
    const order = await db.getOrderById(req.params.orderNumber);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve order' });
  }
});

// Current User's Orders
app.get('/api/orders/mine', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: 'Please sign in to view your orders' });
    }

    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User session invalid' });
    }

    // Return orders associated with user_id or matching their email
    const userOrders = await db.getOrdersByUser(userId);
    const emailOrders = await db.getOrdersByEmail(user.email);

    // Merge and deduplicate by order id
    const orderMap = new Map();
    [...userOrders, ...emailOrders].forEach((o) => orderMap.set(o.id, o));
    const allOrders = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    res.json(allOrders);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch customer orders' });
  }
});

// Auth: Current User
app.get('/api/auth/me', async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({ authenticated: false });
  }

  const user = await db.getUserById(userId);
  if (!user) {
    return res.status(401).json({ authenticated: false });
  }

  res.json({ authenticated: true, user });
});

// Auth: Google Sign-In with Google Cloud Console OAuth token
app.post('/api/auth/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required' });
    }

    let payload: any = null;

    if (googleClientId) {
      try {
        const ticket = await googleAuthClient.verifyIdToken({
          idToken: credential,
          audience: googleClientId,
        });
        payload = ticket.getPayload();
      } catch (verifyErr: any) {
        console.warn('[Auth] Token verification failed with audience, checking payload directly:', verifyErr.message);
      }
    }

    if (!payload) {
      return res.status(401).json({ error: 'Google credential verification failed' });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Failed to extract user profile from Google' });
    }

    const user = await db.upsertUser({
      google_id: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      avatar_url: payload.picture,
    });

    const token = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionTokens.set(token, user.id);

    res.json({
      success: true,
      token,
      user,
    });
  } catch (err: any) {
    console.error('[Auth /api/auth/google] Sign-in error:', err.message);
    res.status(500).json({ error: err.message || 'Google authentication failed' });
  }
});

// Auth: Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    sessionTokens.delete(token);
  }
  res.json({ success: true });
});

// ---------------- VITE / STATIC SERVING ----------------

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[KOKO MARKET] Server running on port ${PORT}`);
  });
}

startServer();
