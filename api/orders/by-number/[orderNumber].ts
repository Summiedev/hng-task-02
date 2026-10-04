import app from '../../../server.js';
import { dispatchApiRoute } from '../../../server/vercel.js';

type VercelRequest = {
  url?: string;
  query?: Record<string, string | string[] | undefined>;
} & Record<string, unknown>;
type VercelResponse = unknown;

export default function handler(req: VercelRequest, res: VercelResponse) {
  const rawOrderNumber = req.query?.orderNumber;
  const orderNumber = Array.isArray(rawOrderNumber) ? rawOrderNumber[0] : rawOrderNumber;
  const routePath = `/api/orders/by-number/${encodeURIComponent(orderNumber || '')}`;
  return dispatchApiRoute(app, req as never, res as never, routePath);
}
