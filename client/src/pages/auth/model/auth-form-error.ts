import type { AuthValidationError } from '@entities/session';

/** A field of the auth form that can carry an error; the server names the same fields in its answers. */
export type AuthField = 'email' | 'password' | 'confirmPassword' | 'consent' | 'termsAccepted' | 'captcha';

/** What the auth form says is wrong — a code, so the text follows a language switch while it is on screen. */
export type AuthFormError =
  | AuthValidationError
  | 'passwordsMismatch'
  | 'consentRequired'
  | 'termsRequired'
  | 'captchaEmpty'
  | 'unknown'
  | 'registrationFailed'
  | 'loginFailed'
  | 'captchaDemanded';

/** The checks of the last submit: a field that passed holds `null`. */
export type AuthFieldErrors = Partial<Record<AuthField, AuthFormError | null>>;

/** A rejected login or registration: the error as thrown, the fields the form shows it under, the text when it has none. */
export type ServerFailure = {
  error: unknown;
  fields: readonly AuthField[];
  fallback: AuthFormError;
};
