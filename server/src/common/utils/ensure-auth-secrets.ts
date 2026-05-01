const DEV_JWT_SECRET_PLACEHOLDER = 'dev-only-jwt-secret-do-not-use-in-production';
const DEV_SESSION_SECRET_PLACEHOLDER = 'dev-only-session-secret-do-not-use-in-production';

function isNonEmpty(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Ensures JWT and express-session signing secrets are present before Nest bootstraps
 * (JwtModule reads `JWT_SECRET_KEY` at registration time).
 *
 * - **production**: missing `JWT_SECRET_KEY` or `SESSION_SECRET_KEY` throws — fail fast.
 * - **non-production**: unset vars get dev-only defaults + console warning so local runs work without a full `.env`.
 */
export function ensureAuthSecretsConfigured(): void {
  const isProduction = process.env.NODE_ENV === 'production';

  const jwt = process.env.JWT_SECRET_KEY;
  const sessionSecret = process.env.SESSION_SECRET_KEY;

  if (isProduction) {
    const missing: string[] = [];
    if (!isNonEmpty(jwt)) {
      missing.push('JWT_SECRET_KEY');
    }
    if (!isNonEmpty(sessionSecret)) {
      missing.push('SESSION_SECRET_KEY');
    }
    if (missing.length > 0) {
      throw new Error(`Missing required secret(s) in production: ${missing.join(', ')}. Set them in the environment.`);
    }
    return;
  }

  if (!isNonEmpty(jwt)) {
    process.env.JWT_SECRET_KEY = DEV_JWT_SECRET_PLACEHOLDER;
    // eslint-disable-next-line no-console
    console.warn(
      '[bootstrap] JWT_SECRET_KEY is unset; using a dev-only placeholder. Set JWT_SECRET_KEY for real deployments.',
    );
  }

  if (!isNonEmpty(sessionSecret)) {
    process.env.SESSION_SECRET_KEY = DEV_SESSION_SECRET_PLACEHOLDER;
    // eslint-disable-next-line no-console
    console.warn(
      '[bootstrap] SESSION_SECRET_KEY is unset; using a dev-only placeholder. Set SESSION_SECRET_KEY for real deployments.',
    );
  }
}
