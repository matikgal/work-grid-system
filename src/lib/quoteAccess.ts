export function buildPublicQuotePath(token: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL.slice(0, -1)
    : import.meta.env.BASE_URL;
  return `${base}/q/${token}`;
}

export function buildPublicQuoteUrl(token: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${buildPublicQuotePath(token)}`;
}
