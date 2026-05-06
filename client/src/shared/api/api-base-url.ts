const trimTrailingSlash = (url: string): string => url.replace(/\/+$/, '');

/**
 * REST API base including version prefix, e.g. `http://localhost:5000/api/1.0`.
 */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (typeof raw === 'string' && raw.length > 0) {
    return trimTrailingSlash(raw);
  }
  return 'http://localhost:5000/api/1.0';
}
