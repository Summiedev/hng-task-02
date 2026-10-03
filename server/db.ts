import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { Category, Order, OrderItem, Product, User } from '../src/types/index.js';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './data/initialData.js';
import { getSelectedUnit } from '../src/utils/product.js';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'store.json');

interface DatabaseStore {
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  order_items: OrderItem[];
  order_emails: Array<{
    id: string;
    order_id: string;
    order_number: string;
    recipient: string;
    subject: string;
    body_text: string;
    body_html: string;
    status: string;
    created_at: string;
  }>;
}

class DatabaseService {
  private isPostgres = false;
  private pgPool: pg.Pool | null = null;
  private initialization: Promise<void> = Promise.resolve();
  private localStore: DatabaseStore = {
    users: [],
    categories: [],
    products: [],
    orders: [],
    order_items: [],
    order_emails: [],
  };

  constructor() {
    this.loadLocal();
    this.initialization = this.init();
  }

  public async waitUntilReady() {
    await this.initialization;
  }

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private saveLocal() {
    try {
      this.ensureDir();
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.localStore, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error saving local store:', err);
    }
  }

  private loadLocal() {
    this.ensureDir();
    if (fs.existsSync(STORE_FILE)) {
      try {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.localStore = {
          users: parsed.users || [],
          // Catalog content is intentionally migrated from the former seed on startup.
          categories: [...INITIAL_CATEGORIES],
          products: [...INITIAL_PRODUCTS],
          orders: parsed.orders || [],
          order_items: parsed.order_items || [],
          order_emails: parsed.order_emails || [],
        };
        this.saveLocal();
      } catch (e) {
        console.error('[DB] Failed reading store.json, resetting to seed data:', e);
        this.resetToDefaults();
      }
    } else {
      this.resetToDefaults();
    }
  }

  private resetToDefaults() {
    this.localStore = {
      users: [
        {
          id: 'user-demo-apatirasummie',
          google_id: 'google-sub-demo-1001',
          email: 'apatirasummie@gmail.com',
          name: 'Summie Apatira',
          avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=SA&backgroundColor=A93B24&textColor=ffffff',
          created_at: new Date().toISOString(),
        },
      ],
      categories: [...INITIAL_CATEGORIES],
      products: [...INITIAL_PRODUCTS],
      orders: [],
      order_items: [],
      order_emails: [],
    };
    this.saveLocal();
  }

  public async init() {
    const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (dbUrl && !dbUrl.includes('user:password@ep-sample')) {
      try {
        console.log('[DB] Connecting to PostgreSQL database (Supabase/Neon)...');
        this.pgPool = new Pool({
          connectionString: dbUrl,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 10000,
        });

        // Test connection
        await this.pgPool.query('SELECT NOW()');
        await this.initPostgresSchema();
        this.isPostgres = true;
        console.log('[DB] PostgreSQL database successfully connected and schema verified.');
      } catch (err) {
        console.warn('[DB] PostgreSQL connection failed, operating with local persistent engine:', (err as Error).message);
        this.isPostgres = false;
        if (this.pgPool) {
          try {
            await this.pgPool.end();
          } catch {}
          this.pgPool = null;
        }
      }
    } else {
      console.log('[DB] Operating with persistent relational database engine.');
    }
  }

  private async initPostgresSchema() {
    if (!this.pgPool) return;

    await this.pgPool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT
      );
    `);

    await this.pgPool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        detailed_description TEXT,
        price INTEGER NOT NULL,
        category_id TEXT NOT NULL,
        category_slug TEXT NOT NULL,
        image TEXT NOT NULL,
        hover_image TEXT,
        gallery TEXT[],
        stock INTEGER NOT NULL DEFAULT 0,
        sku TEXT NOT NULL,
        weight TEXT NOT NULL,
        ingredients TEXT,
        allergen_info TEXT,
        storage_info TEXT,
        unit_options JSONB,
        sizes TEXT[],
        colors TEXT[],
        is_featured BOOLEAN DEFAULT FALSE,
        is_bestseller BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE products ADD COLUMN IF NOT EXISTS hover_image TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery TEXT[];
      ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT[];
      ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT[];
      ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_options JSONB;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE;
    `);

    await this.pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        google_id TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await this.pgPool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_number TEXT UNIQUE NOT NULL,
        user_id TEXT,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        delivery_city TEXT NOT NULL,
        delivery_state TEXT NOT NULL,
        delivery_country TEXT NOT NULL,
        delivery_fee INTEGER NOT NULL,
        subtotal INTEGER NOT NULL,
        total INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        payment_status TEXT NOT NULL DEFAULT 'paid',
        mailgun_status TEXT NOT NULL DEFAULT 'queued',
        idempotency_key TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await this.pgPool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        product_sku TEXT NOT NULL,
        product_image TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price INTEGER NOT NULL,
        total_price INTEGER NOT NULL,
        selected_size TEXT
      );
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_size TEXT;
    `);

    await this.pgPool.query(`
      CREATE TABLE IF NOT EXISTS order_emails (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        order_number TEXT NOT NULL,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        body_text TEXT,
        body_html TEXT,
        status TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Upsert categories
    for (const cat of INITIAL_CATEGORIES) {
      await this.pgPool.query(
        `INSERT INTO categories (id, slug, name, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           slug = EXCLUDED.slug,
           name = EXCLUDED.name,
           description = EXCLUDED.description;`,
        [cat.id, cat.slug, cat.name, cat.description]
      );
    }

    // Upsert the current food catalogue.
    for (const prod of INITIAL_PRODUCTS) {
      await this.pgPool.query(
        `INSERT INTO products (
          id, slug, name, description, detailed_description, price, category_id,
          category_slug, image, hover_image, gallery, stock, sku, weight, ingredients, allergen_info,
          storage_info, unit_options, sizes, colors, is_featured, is_bestseller, created_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        )
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          detailed_description = EXCLUDED.detailed_description,
          price = EXCLUDED.price,
          category_id = EXCLUDED.category_id,
          category_slug = EXCLUDED.category_slug,
          image = EXCLUDED.image,
          hover_image = EXCLUDED.hover_image,
          gallery = EXCLUDED.gallery,
          stock = EXCLUDED.stock,
          sku = EXCLUDED.sku,
          weight = EXCLUDED.weight,
          ingredients = EXCLUDED.ingredients,
          allergen_info = EXCLUDED.allergen_info,
          storage_info = EXCLUDED.storage_info,
          unit_options = EXCLUDED.unit_options,
          sizes = EXCLUDED.sizes,
          colors = EXCLUDED.colors,
          is_featured = EXCLUDED.is_featured,
          is_bestseller = EXCLUDED.is_bestseller;`,
        [
          prod.id,
          prod.slug,
          prod.name,
          prod.description,
          prod.detailed_description,
          prod.price,
          prod.category_id,
          prod.category_slug,
          prod.image,
          prod.hover_image || null,
          prod.gallery || [prod.image],
          prod.stock,
          prod.sku,
          prod.weight,
          prod.ingredients,
          prod.allergen_info || '',
          prod.storage_info,
          JSON.stringify(prod.unit_options || [{ label: prod.weight, price: prod.price }]),
          prod.sizes || [],
          prod.colors || [],
          prod.is_featured,
          prod.is_bestseller || false,
          prod.created_at,
        ]
      );
    }

    // Remove any records from the previous catalogue while keeping order history intact.
    await this.pgPool.query('DELETE FROM products WHERE NOT (id = ANY($1::text[]));', [INITIAL_PRODUCTS.map((p) => p.id)]);
    await this.pgPool.query('DELETE FROM categories WHERE NOT (id = ANY($1::text[]));', [INITIAL_CATEGORIES.map((c) => c.id)]);
  }

  // Categories
  public async getCategories(): Promise<Category[]> {
    let cats: Category[] = [];
    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT * FROM categories;');
        cats = res.rows as Category[];
      } catch (err) {
        console.error('[DB] Error querying categories:', err);
      }
    } else {
      cats = this.localStore.categories;
    }

    return cats.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Products
  public async getProducts(filter?: {
    categorySlug?: string;
    search?: string;
    inStockOnly?: boolean;
    sort?: string;
  }): Promise<Product[]> {
    let list: Product[] = [];
    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          'SELECT * FROM products WHERE id = ANY($1::text[]) ORDER BY created_at DESC;',
          [INITIAL_PRODUCTS.map((product) => product.id)]
        );
        list = res.rows as Product[];
      } catch (err) {
        console.error('[DB] Error querying products from postgres, falling back to cache:', err);
        list = [...this.localStore.products];
      }
    } else {
      list = [...this.localStore.products];
    }

    if (filter?.categorySlug && filter.categorySlug !== 'all') {
      list = list.filter((p) => p.category_slug.toLowerCase() === filter.categorySlug?.toLowerCase());
    }

    if (filter?.search) {
      const term = filter.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.ingredients.toLowerCase().includes(term) ||
          p.category_slug.toLowerCase().includes(term)
      );
    }

    if (filter?.inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    if (filter?.sort) {
      if (filter.sort === 'price-asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (filter.sort === 'price-desc') {
        list.sort((a, b) => b.price - a.price);
      } else if (filter.sort === 'newest') {
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (filter.sort === 'featured') {
        list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      }
    }

    return list;
  }

  public async getProductBySlug(slug: string): Promise<Product | null> {
    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT * FROM products WHERE slug = $1 AND id = ANY($2::text[]) LIMIT 1;', [slug, INITIAL_PRODUCTS.map((product) => product.id)]);
        if (res.rows.length > 0) return res.rows[0] as Product;
      } catch (err) {
        console.error('[DB] Error querying product by slug:', err);
      }
    }
    return this.localStore.products.find((p) => p.slug === slug) || null;
  }

  public async getProductById(id: string): Promise<Product | null> {
    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT * FROM products WHERE id = $1 AND id = ANY($2::text[]) LIMIT 1;', [id, INITIAL_PRODUCTS.map((product) => product.id)]);
        if (res.rows.length > 0) return res.rows[0] as Product;
      } catch (err) {
        console.error('[DB] Error querying product by id:', err);
      }
    }
    return this.localStore.products.find((p) => p.id === id) || null;
  }

  // Users
  public async getUserByEmail(email: string): Promise<User | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1;', [cleanEmail]);
        if (res.rows.length > 0) return res.rows[0] as User;
      } catch (err) {
        console.error('[DB] Error querying user by email:', err);
      }
    }
    return this.localStore.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  }

  public async getUserById(id: string): Promise<User | null> {
    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT * FROM users WHERE id = $1 LIMIT 1;', [id]);
        if (res.rows.length > 0) return res.rows[0] as User;
      } catch (err) {
        console.error('[DB] Error querying user by id:', err);
      }
    }
    return this.localStore.users.find((u) => u.id === id) || null;
  }

  public async upsertUser(user: {
    google_id?: string;
    email: string;
    name: string;
    avatar_url?: string;
  }): Promise<User> {
    const cleanEmail = user.email.toLowerCase().trim();
    let existing = await this.getUserByEmail(cleanEmail);

    if (existing) {
      existing.name = user.name || existing.name;
      existing.avatar_url = user.avatar_url || existing.avatar_url;
      if (user.google_id) existing.google_id = user.google_id;

      if (this.isPostgres && this.pgPool) {
        try {
          await this.pgPool.query(
            `UPDATE users
             SET name = $1, avatar_url = $2, google_id = $3
             WHERE id = $4;`,
            [existing.name, existing.avatar_url, existing.google_id, existing.id]
          );
        } catch (err) {
          console.error('[DB] Error updating user in postgres:', err);
        }
      }

      const idx = this.localStore.users.findIndex((u) => u.id === existing?.id);
      if (idx >= 0) this.localStore.users[idx] = existing;
      this.saveLocal();
      return existing;
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      google_id: user.google_id,
      email: cleanEmail,
      name: user.name,
      avatar_url: user.avatar_url,
      created_at: new Date().toISOString(),
    };

    if (this.isPostgres && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO users (id, google_id, email, name, avatar_url, created_at)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [newUser.id, newUser.google_id, newUser.email, newUser.name, newUser.avatar_url, newUser.created_at]
        );
      } catch (err) {
        console.error('[DB] Error inserting user in postgres:', err);
      }
    }

    this.localStore.users.push(newUser);
    this.saveLocal();

    return newUser;
  }

  // Orders
  public async createOrder(orderInput: {
    user_id?: string | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address: string;
    delivery_city: string;
    delivery_state: string;
    delivery_country: string;
    delivery_fee: number;
    items: Array<{ productId: string; quantity: number; selectedSize?: string }>;
    idempotency_key?: string;
  }): Promise<Order> {
    // 1. Idempotency check: if already processed, return existing order
    if (orderInput.idempotency_key) {
      if (this.isPostgres && this.pgPool) {
        try {
          const res = await this.pgPool.query(
            'SELECT * FROM orders WHERE idempotency_key = $1 LIMIT 1;',
            [orderInput.idempotency_key]
          );
          if (res.rows.length > 0) {
            const ord = res.rows[0] as Order;
            const itemsRes = await this.pgPool.query(
              'SELECT * FROM order_items WHERE order_id = $1;',
              [ord.id]
            );
            ord.items = itemsRes.rows as OrderItem[];
            return ord;
          }
        } catch {}
      }

      const existing = this.localStore.orders.find(
        (o) => o.idempotency_key === orderInput.idempotency_key
      );
      if (existing) {
        return existing;
      }
    }

    // 2. Validate items and verify inventory server-side directly from DB
    if (!orderInput.items || orderInput.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    let calculatedSubtotal = 0;
    const preparedItems: Array<{
      product: Product;
      quantity: number;
      unit_price: number;
      total_price: number;
      selected_size?: string;
    }> = [];

    for (const item of orderInput.items) {
      if (item.quantity <= 0) {
        throw new Error('Item quantity must be greater than zero');
      }

      const product = await this.getProductById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`
        );
      }

      const selectedUnit = getSelectedUnit(product, item.selectedSize);
      const itemTotal = selectedUnit.price * item.quantity;
      calculatedSubtotal += itemTotal;

      preparedItems.push({
        product,
        quantity: item.quantity,
        unit_price: selectedUnit.price,
        total_price: itemTotal,
        selected_size: selectedUnit.label,
      });
    }

    // 3. Atomically decrement stock
    for (const prep of preparedItems) {
      prep.product.stock -= prep.quantity;
      if (this.isPostgres && this.pgPool) {
        try {
          await this.pgPool.query(
            'UPDATE products SET stock = stock - $1 WHERE id = $2;',
            [prep.quantity, prep.product.id]
          );
        } catch (err) {
          console.error('[DB] Error decrementing stock in postgres:', err);
        }
      }

      const prodIndex = this.localStore.products.findIndex((p) => p.id === prep.product.id);
      if (prodIndex >= 0) {
        this.localStore.products[prodIndex].stock = prep.product.stock;
      }
    }

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `KM-${new Date().getFullYear()}-${randomSuffix}`;
    const calculatedTotal = calculatedSubtotal + orderInput.delivery_fee;

    const orderItems: OrderItem[] = preparedItems.map((p, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      order_id: orderId,
      product_id: p.product.id,
      product_name: p.product.name,
      product_sku: p.product.sku,
      product_image: p.product.image,
      quantity: p.quantity,
      unit_price: p.unit_price,
      total_price: p.total_price,
      selected_size: p.selected_size,
    }));

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      user_id: orderInput.user_id || null,
      customer_name: orderInput.customer_name.trim(),
      customer_email: orderInput.customer_email.trim().toLowerCase(),
      customer_phone: orderInput.customer_phone.trim(),
      delivery_address: orderInput.delivery_address.trim(),
      delivery_city: orderInput.delivery_city.trim(),
      delivery_state: orderInput.delivery_state.trim(),
      delivery_country: orderInput.delivery_country.trim() || 'Nigeria',
      delivery_fee: orderInput.delivery_fee,
      subtotal: calculatedSubtotal,
      total: calculatedTotal,
      status: 'confirmed',
      payment_status: 'paid',
      mailgun_status: 'queued',
      idempotency_key: orderInput.idempotency_key,
      created_at: new Date().toISOString(),
      items: orderItems,
    };

    if (this.isPostgres && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO orders (
            id, order_number, user_id, customer_name, customer_email, customer_phone,
            delivery_address, delivery_city, delivery_state, delivery_country,
            delivery_fee, subtotal, total, status, payment_status, mailgun_status,
            idempotency_key, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
          );`,
          [
            newOrder.id,
            newOrder.order_number,
            newOrder.user_id,
            newOrder.customer_name,
            newOrder.customer_email,
            newOrder.customer_phone,
            newOrder.delivery_address,
            newOrder.delivery_city,
            newOrder.delivery_state,
            newOrder.delivery_country,
            newOrder.delivery_fee,
            newOrder.subtotal,
            newOrder.total,
            newOrder.status,
            newOrder.payment_status,
            newOrder.mailgun_status,
            newOrder.idempotency_key,
            newOrder.created_at,
          ]
        );

        for (const item of orderItems) {
          await this.pgPool.query(
            `INSERT INTO order_items (
              id, order_id, product_id, product_name, product_sku, product_image,
              quantity, unit_price, total_price, selected_size
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
            [
              item.id,
              item.order_id,
              item.product_id,
              item.product_name,
              item.product_sku,
              item.product_image,
              item.quantity,
              item.unit_price,
              item.total_price,
              item.selected_size,
            ]
          );
        }
      } catch (err) {
        console.error('[DB] Error persisting order to postgres:', err);
      }
    }

    // Always update local cache & backup
    this.localStore.orders.unshift(newOrder);
    this.localStore.order_items.push(...orderItems);
    this.saveLocal();

    return newOrder;
  }

  public async getOrderById(id: string): Promise<Order | null> {
    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          'SELECT * FROM orders WHERE id = $1 OR order_number = $1 LIMIT 1;',
          [id]
        );
        if (res.rows.length > 0) {
          const ord = res.rows[0] as Order;
          const itemsRes = await this.pgPool.query(
            'SELECT * FROM order_items WHERE order_id = $1;',
            [ord.id]
          );
          ord.items = itemsRes.rows as OrderItem[];
          return ord;
        }
      } catch (err) {
        console.error('[DB] Error querying order by id from postgres:', err);
      }
    }

    const order = this.localStore.orders.find((o) => o.id === id || o.order_number === id);
    if (!order) return null;
    return order;
  }

  public async getOrdersByUser(userId: string): Promise<Order[]> {
    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC;',
          [userId]
        );
        const orders = res.rows as Order[];
        for (const ord of orders) {
          const itemsRes = await this.pgPool.query(
            'SELECT * FROM order_items WHERE order_id = $1;',
            [ord.id]
          );
          ord.items = itemsRes.rows as OrderItem[];
        }
        return orders;
      } catch (err) {
        console.error('[DB] Error querying orders by user from postgres:', err);
      }
    }

    return this.localStore.orders.filter((o) => o.user_id === userId);
  }

  public async getOrdersByEmail(email: string): Promise<Order[]> {
    const cleanEmail = email.toLowerCase().trim();
    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          'SELECT * FROM orders WHERE LOWER(customer_email) = $1 ORDER BY created_at DESC;',
          [cleanEmail]
        );
        const orders = res.rows as Order[];
        for (const ord of orders) {
          const itemsRes = await this.pgPool.query(
            'SELECT * FROM order_items WHERE order_id = $1;',
            [ord.id]
          );
          ord.items = itemsRes.rows as OrderItem[];
        }
        return orders;
      } catch (err) {
        console.error('[DB] Error querying orders by email from postgres:', err);
      }
    }

    return this.localStore.orders.filter((o) => o.customer_email.toLowerCase() === cleanEmail);
  }

  public async updateOrderMailgunStatus(
    orderId: string,
    status: 'sent' | 'queued' | 'preview_mode' | 'failed'
  ) {
    if (this.isPostgres && this.pgPool) {
      try {
        await this.pgPool.query(
          'UPDATE orders SET mailgun_status = $1 WHERE id = $2;',
          [status, orderId]
        );
      } catch (err) {
        console.error('[DB] Error updating mailgun status in postgres:', err);
      }
    }

    const order = this.localStore.orders.find((o) => o.id === orderId);
    if (order) {
      order.mailgun_status = status;
      this.saveLocal();
    }
  }

  public async logEmail(record: {
    order_id: string;
    order_number: string;
    recipient: string;
    subject: string;
    body_text: string;
    body_html: string;
    status: string;
  }) {
    const emailId = `eml-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    if (this.isPostgres && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO order_emails (id, order_id, order_number, recipient, subject, body_text, body_html, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
          [
            emailId,
            record.order_id,
            record.order_number,
            record.recipient,
            record.subject,
            record.body_text,
            record.body_html,
            record.status,
            now,
          ]
        );
      } catch (err) {
        console.error('[DB] Error logging email to postgres:', err);
      }
    }

    this.localStore.order_emails.push({
      id: emailId,
      ...record,
      created_at: now,
    });
    this.saveLocal();
  }
}

export const db = new DatabaseService();
