import { SignOptions } from 'jsonwebtoken';

/** Signed into every access token and required when one is verified: a JWT minted for anything else opens no route. */
export const ACCESS_TOKEN_CLAIMS = {
  issuer: 'set-forge-api',
  audience: 'set-forge-api',
} as const satisfies Pick<SignOptions, 'issuer' | 'audience'>;
