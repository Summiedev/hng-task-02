import type { Application, Request, Response } from 'express';

/** Dispatch a Vercel function request through the shared Express API router. */
export function dispatchApiRoute(
  app: Application,
  req: Request,
  res: Response,
  routePath: string,
) {
  const originalUrl = req.url || '';
  const queryIndex = originalUrl.indexOf('?');
  req.url = `${routePath}${queryIndex >= 0 ? originalUrl.slice(queryIndex) : ''}`;
  return app(req, res);
}
