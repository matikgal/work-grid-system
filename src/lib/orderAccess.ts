export function buildPublicOrderPath(orderId: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL.slice(0, -1)
    : import.meta.env.BASE_URL;
  return `${base}/order/${orderId}`;
}

export function buildPublicOrderUrl(orderId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${buildPublicOrderPath(orderId)}`;
}
