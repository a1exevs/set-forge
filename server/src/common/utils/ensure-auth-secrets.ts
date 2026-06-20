function isNonEmpty(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates auth-related secrets before Nest bootstraps.
 *
 * - **production**: `JWT_SECRET_KEY` and `SESSION_SECRET_KEY` must already be set on `process.env`
 *   (e.g. injected by the host). This runs before `ConfigModule` reads `.env` files, so production
 *   deployments should rely on real environment variables, not only an env file on disk.
 * - **non-production**: no mutation and no early validation — values may appear only in
 *   `.{NODE_ENV}.env`, which `ConfigModule` loads during `NestFactory.create`. Do not write dev
 *   placeholders into `process.env` here: that runs before dotenv and can prevent real keys from
 *   the env file from being applied (dotenv does not override existing keys).
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
