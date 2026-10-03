import app from '../server.js';

type VercelRequest = { url?: string };
type VercelResponse = unknown;

/**
 * Vercel may pass a function request as `/`, `/products`, or the original
 * `/api/products` path depending on the function entry point. Normalize all
 * three shapes before handing the request to the existing Express router.
 */
export function createExpressHandler(routePath = '/api') {
  return (req: VercelRequest & Record<string, unknown>, res: VercelResponse) => {
    const originalUrl = req.url || '/';
    const [pathname, query = ''] = originalUrl.split('?');
    const publicRoute = routePath.replace(/^\/api/, '') || '/';
    const routeName = routePath.slice(routePath.lastIndexOf('/'));

    if (!pathname.startsWith('/api')) {
      const normalizedPath = pathname === '/' || pathname === publicRoute || pathname === routeName
        ? routePath
        : `${routePath}${pathname}`;
      req.url = `${normalizedPath}${query ? `?${query}` : ''}`;
    }

    return app(req as never, res as never);
  };
}
