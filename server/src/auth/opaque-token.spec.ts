import { createHash } from 'node:crypto';

import { hashOpaqueToken, newOpaqueToken } from '@auth/opaque-token';

describe('opaque token', () => {
  it('should be 256 random bits in base64url, new every time', () => {
    const first = newOpaqueToken();

    expect(Buffer.from(first, 'base64url')).toHaveLength(32);
    expect(first).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(newOpaqueToken()).not.toBe(first);
  });

  it('should be stored as its SHA-256 in hex', () => {
    expect(hashOpaqueToken('token')).toBe(createHash('sha256').update('token').digest('hex'));
  });
});
