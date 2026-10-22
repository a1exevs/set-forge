const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** What is wrong with a sign-in or registration field: a code, so the screen says it in the chosen language. */
export type AuthValidationError = 'emailRequired' | 'emailInvalid' | 'passwordLength' | 'passwordRequired';

export function validateRegisterEmail(email: string): AuthValidationError | null {
  const v = email.trim();
  if (!v) {
    return 'emailRequired';
  }
  if (!EMAIL_RE.test(v)) {
    return 'emailInvalid';
  }
  return null;
}

export function validateRegisterPassword(password: string): AuthValidationError | null {
  if (password.length < 8 || password.length > 50) {
    return 'passwordLength';
  }
  return null;
}

export function validateLoginEmail(email: string): AuthValidationError | null {
  const v = email.trim();
  if (!v) {
    return 'emailRequired';
  }
  return null;
}

export function validateLoginPassword(password: string): AuthValidationError | null {
  if (!password) {
    return 'passwordRequired';
  }
  return null;
}
