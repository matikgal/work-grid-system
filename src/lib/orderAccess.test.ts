import { describe, it, expect } from 'vitest';
import { buildPublicOrderPath, buildPublicOrderUrl } from './orderAccess';

describe('orderAccess', () => {
  it('builds public order path with order id', () => {
    const path = buildPublicOrderPath('abc-123');
    expect(path).toContain('/order/abc-123');
    expect(path).not.toContain('pin');
  });

  it('builds full public order url', () => {
    const url = buildPublicOrderUrl('abc-123');
    expect(url).toContain('/order/abc-123');
  });
});
