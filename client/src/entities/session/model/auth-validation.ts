const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterEmail(email: string): string | null {
  const v = email.trim();
  if (!v) {
    return 'Email is required';
  }
  if (!EMAIL_RE.test(v)) {
    return 'Enter a valid email';
  }
  return null;
}

export function validateRegisterPassword(password: string): string | null {
  if (password.length < 8 || password.length > 50) {
    return 'Password must be between 8 and 50 characters';
  }
  return null;
}

export function validateLoginEmail(email: string): string | null {
  const v = email.trim();
  if (!v) {
    return 'Email is required';
  }
  return null;
}

export function validateLoginPassword(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }
  return null;
}
