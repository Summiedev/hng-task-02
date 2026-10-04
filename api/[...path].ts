import app from '../server.js';

type VercelRequest = { url?: string } & Record<string, unknown>;
type VercelResponse = unknown;

/**
 * General API entrypoint for the Express router. Nested routes used by the
 * browser also have explicit Vercel wrappers so they appear in deployments
 * that do not resolve this catch-all for deeper paths.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const originalUrl = req.url || '/';
  const [pathname, query = ''] = originalUrl.split('?');

  if (!pathname.startsWith('/api')) {
    req.url = `/api${pathname === '/' ? '' : pathname}${query ? `?${query}` : ''}`;
  }

  return app(req as never, res as never);
}
