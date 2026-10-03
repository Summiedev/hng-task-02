import { Order } from '../src/types/index.js';
import { db } from './db.js';

export interface EmailRenderResult { subject: string; from: string; to: string; html: string; text: string; }
export function formatNaira(amount: number) { return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount); }

export function generateOrderConfirmationEmail(order: Order): EmailRenderResult {
  const domain = process.env.MAILGUN_DOMAIN || 'mg.kokomarket.ng';
  const from = process.env.MAILGUN_FROM || `KOKO MARKET <orders@${domain}>`;
  const subject = `Order confirmation #${order.order_number} — KOKO MARKET`;
  const rows = order.items.map((item) => `<tr><td style="padding:12px 0;border-bottom:1px solid #d9cdbb"><strong>${item.product_name}</strong><br><small>${item.product_sku} · Qty ${item.quantity}</small></td><td style="padding:12px 0;border-bottom:1px solid #d9cdbb;text-align:right">${formatNaira(item.total_price)}</td></tr>`).join('');
  const html = `<!doctype html><html><body style="margin:0;background:#20251e;font-family:Arial,sans-serif;color:#20251e"><main style="max-width:620px;margin:32px auto;background:#fffaf2;padding:32px"><p style="font-size:12px;letter-spacing:2px;color:#a05b35;text-transform:uppercase">Koko Market · Lagos Pantry &amp; Provisions</p><h1>Order confirmed</h1><p>Thank you, ${order.customer_name}. Your food order <strong>#${order.order_number}</strong> is being packed for delivery.</p><table style="width:100%;border-collapse:collapse">${rows}</table><p>Subtotal: <strong>${formatNaira(order.subtotal)}</strong><br>Delivery: <strong>${formatNaira(order.delivery_fee)}</strong><br>Total: <strong>${formatNaira(order.total)}</strong></p><div style="background:#f0e7d8;padding:16px"><strong>Delivery address</strong><br>${order.customer_name}<br>${order.delivery_address}<br>${order.delivery_city}, ${order.delivery_state}<br>${order.delivery_country}<br>${order.customer_phone}</div><p style="color:#6f6a60">Thanks for shopping the Koko pantry.</p></main></body></html>`;
  const text = [`KOKO MARKET — Lagos Pantry & Provisions`, `Order #${order.order_number}`, ``, `Thank you, ${order.customer_name}.`, ``, `Food order:`, ...order.items.map((item) => `- ${item.product_name} (${item.product_sku}) x${item.quantity}: ${formatNaira(item.total_price)}`), ``, `Subtotal: ${formatNaira(order.subtotal)}`, `Delivery: ${formatNaira(order.delivery_fee)}`, `Total: ${formatNaira(order.total)}`, ``, `Delivery address:`, order.customer_name, order.delivery_address, `${order.delivery_city}, ${order.delivery_state}`, order.delivery_country, order.customer_phone].join('\n');
  return { subject, from, to: order.customer_email, html, text };
}

export async function sendOrderConfirmationEmail(order: Order): Promise<{ status: 'sent' | 'queued' | 'preview_mode' | 'failed'; error?: string; preview: EmailRenderResult }> {
  const preview = generateOrderConfirmationEmail(order); const apiKey = process.env.MAILGUN_API_KEY; const domain = process.env.MAILGUN_DOMAIN;
  if (apiKey && domain && !apiKey.startsWith('key-xxx')) {
    try { const params = new URLSearchParams({ from: preview.from, to: preview.to, subject: preview.subject, text: preview.text, html: preview.html }); const apiBase = (process.env.MAILGUN_API_BASE_URL || (process.env.MAILGUN_REGION === 'EU' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net')).replace(/\/$/, ''); const response = await fetch(`${apiBase}/v3/${domain}/messages`, { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() }); if (!response.ok) throw new Error(await response.text()); await db.updateOrderMailgunStatus(order.id, 'sent'); await db.logEmail({ order_id: order.id, order_number: order.order_number, recipient: order.customer_email, subject: preview.subject, body_text: preview.text, body_html: preview.html, status: 'sent' }); return { status: 'sent', preview }; } catch (error: any) { await db.updateOrderMailgunStatus(order.id, 'failed'); return { status: 'failed', error: error.message, preview }; }
  }
  await db.updateOrderMailgunStatus(order.id, 'preview_mode'); await db.logEmail({ order_id: order.id, order_number: order.order_number, recipient: order.customer_email, subject: preview.subject, body_text: preview.text, body_html: preview.html, status: 'preview_mode' }); return { status: 'preview_mode', preview };
}
