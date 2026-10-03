export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    let message = response.status === 404
      ? 'The Koko Market API route is not deployed yet. Redeploy the latest Vercel build.'
      : `Request failed (${response.status})`;
    if (contentType.includes('application/json')) {
      try {
        const payload = await response.json() as { error?: string; message?: string };
        message = payload.error || payload.message || message;
      } catch {
        // Keep the useful status message if a broken server response is not JSON.
      }
    }
    throw new Error(message);
  }

  if (!contentType.includes('application/json')) {
    throw new Error('The Koko Market API is unavailable. Please redeploy the Vercel API route.');
  }

  return response.json() as Promise<T>;
}
