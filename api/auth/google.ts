import app from '../../server.js';

type VercelRequest = { url?: string } & Record<string, unknown>;
type VercelResponse = unknown;

/**
 * Expose Google credential sign-in as an explicit Vercel function route.
 * The API catch-all remains the entrypoint for the other Express routes.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const query = (req.url || '').split('?')[1];
  req.url = `/api/auth/google${query ? `?${query}` : ''}`;
  return app(req as never, res as never);
}
