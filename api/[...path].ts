import app from '../server.js';

type VercelRequest = { url?: string } & Record<string, unknown>;
type VercelResponse = unknown;

/**
 * This is deliberately the only serverless entrypoint. Vercel forwards every
 * `/api/*` request here, and Express continues to own the actual route table.
 * Keeping the router in one function avoids Vercel's hobby-plan function cap.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const originalUrl = req.url || '/';
  const [pathname, query = ''] = originalUrl.split('?');

  if (!pathname.startsWith('/api')) {
    req.url = `/api${pathname === '/' ? '' : pathname}${query ? `?${query}` : ''}`;
  }

  return app(req as never, res as never);
}
