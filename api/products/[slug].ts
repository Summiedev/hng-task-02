import app from '../../server.js';
import { dispatchApiRoute } from '../../server/vercel.js';

type VercelRequest = {
  url?: string;
  query?: Record<string, string | string[] | undefined>;
} & Record<string, unknown>;
type VercelResponse = unknown;

export default function handler(req: VercelRequest, res: VercelResponse) {
  const rawSlug = req.query?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const routePath = `/api/products/${encodeURIComponent(slug || '')}`;
  return dispatchApiRoute(app, req as never, res as never, routePath);
}
