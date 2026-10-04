import app from '../../server.js';
import { dispatchApiRoute } from '../../server/vercel.js';

type VercelRequest = { url?: string } & Record<string, unknown>;
type VercelResponse = unknown;

export default function handler(req: VercelRequest, res: VercelResponse) {
  return dispatchApiRoute(app, req as never, res as never, '/api/orders/mine');
}
