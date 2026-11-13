import { ensureAuthSecretsConfigured } from '@common/utils/ensure-auth-secrets';

describe('ensureAuthSecretsConfigured', () => {
  const saved = { ...process.env };

  afterEach(() => {
    process.env = { ...saved };
  });

  it('should demand the JWT and the sign-in limit secrets in production', () => {
    process.env = { ...saved, NODE_ENV: 'production', JWT_SECRET_KEY: '', SIGN_IN_LIMIT_SECRET_KEY: ' ' };

    expect(() => ensureAuthSecretsConfigured()).toThrow('JWT_SECRET_KEY, SIGN_IN_LIMIT_SECRET_KEY');
  });

  it('should pass in production when both are set', () => {
    process.env = { ...saved, NODE_ENV: 'production', JWT_SECRET_KEY: 'a', SIGN_IN_LIMIT_SECRET_KEY: 'b' };

    expect(() => ensureAuthSecretsConfigured()).not.toThrow();
  });

  it('should demand nothing outside production', () => {
    process.env = { ...saved, NODE_ENV: 'development', JWT_SECRET_KEY: '', SIGN_IN_LIMIT_SECRET_KEY: '' };

    expect(() => ensureAuthSecretsConfigured()).not.toThrow();
  });
});
