import { createHash, randomBytes } from 'node:crypto';

const OPAQUE_TOKEN_BYTES = 32;

/** A random value that means something only through its stored hash. */
export function newOpaqueToken(): string {
  return randomBytes(OPAQUE_TOKEN_BYTES).toString('base64url');
}

/** The token carries 256 random bits, so a plain SHA-256 suffices: guessing needs no salt or slow hash to stop it. */
export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
