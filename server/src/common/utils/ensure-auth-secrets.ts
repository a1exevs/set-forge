function isNonEmpty(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Production only: `JWT_SECRET_KEY` and `SESSION_SECRET_KEY` must already be on `process.env` — this runs before
 * `ConfigModule` reads the env files. Elsewhere it writes nothing: dotenv never overrides a key already set.
 */
export function ensureAuthSecretsConfigured(): void {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    return;
  }

  const missing: string[] = [];
  if (!isNonEmpty(process.env.JWT_SECRET_KEY)) {
    missing.push('JWT_SECRET_KEY');
  }
  if (!isNonEmpty(process.env.SESSION_SECRET_KEY)) {
    missing.push('SESSION_SECRET_KEY');
  }
  if (missing.length > 0) {
    throw new Error(`Missing required secret(s) in production: ${missing.join(', ')}. Set them in the environment.`);
  }
}
