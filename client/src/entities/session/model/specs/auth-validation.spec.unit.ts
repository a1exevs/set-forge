import {
  validateLoginEmail,
  validateLoginPassword,
  validateRegisterEmail,
  validateRegisterPassword,
} from '../auth-validation';

describe('auth validation', () => {
  it('asks for an email, and a well-formed one at registration', () => {
    expect(validateLoginEmail('  ')).toBe('emailRequired');
    expect(validateLoginEmail('jane')).toBeNull();
    expect(validateRegisterEmail('')).toBe('emailRequired');
    expect(validateRegisterEmail('jane@')).toBe('emailInvalid');
    expect(validateRegisterEmail(' jane@example.com ')).toBeNull();
  });

  it('asks for a password, 8 to 50 characters at registration', () => {
    expect(validateLoginPassword('')).toBe('passwordRequired');
    expect(validateLoginPassword('x')).toBeNull();
    expect(validateRegisterPassword('1234567')).toBe('passwordLength');
    expect(validateRegisterPassword('x'.repeat(51))).toBe('passwordLength');
    expect(validateRegisterPassword('12345678')).toBeNull();
  });
});
