process.env.SERVER_STATIC = 'static-test';
process.env.SERVER_LOGS = 'logger-test';

if (!process.env.JWT_SECRET_KEY?.trim()) {
  process.env.JWT_SECRET_KEY = 'unit-test-jwt-secret';
}
if (!process.env.SIGN_IN_LIMIT_SECRET_KEY?.trim()) {
  process.env.SIGN_IN_LIMIT_SECRET_KEY = 'unit-test-sign-in-limit-secret';
}