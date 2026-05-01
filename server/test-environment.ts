process.env.SERVER_STATIC = 'static-test';
process.env.SERVER_URL='http://localhost';
process.env.PORT='5000';
process.env.SERVER_LOGS='logger-test';

if (!process.env.JWT_SECRET_KEY?.trim()) {
  process.env.JWT_SECRET_KEY = 'unit-test-jwt-secret';
}
if (!process.env.SESSION_SECRET_KEY?.trim()) {
  process.env.SESSION_SECRET_KEY = 'unit-test-session-secret';
}