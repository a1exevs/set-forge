import { exhaustiveCheck, type Nullable } from '@alexevs/ts-guards';

import { apiErrorTexts, ApiRequestError } from '@shared/api';
import type { Translate } from '@shared/lib';

import type { AuthField, AuthFormError, ServerFailure } from '../model/auth-form-error';

export const authErrorText = (error: AuthFormError, t: Translate): string => {
  switch (error) {
    case 'emailRequired':
      return t('auth.errors.emailRequired');
    case 'emailInvalid':
      return t('auth.errors.emailInvalid');
    case 'passwordLength':
      return t('auth.errors.passwordLength');
    case 'passwordRequired':
      return t('auth.errors.passwordRequired');
    case 'passwordsMismatch':
      return t('auth.errors.passwordsMismatch');
    case 'consentRequired':
      return t('auth.errors.consentRequired');
    case 'termsRequired':
      return t('auth.errors.termsRequired');
    case 'captchaEmpty':
      return t('auth.errors.captchaEmpty');
    case 'unknown':
      return t('auth.errors.unknown');
    case 'registrationFailed':
      return t('auth.errors.registrationFailed');
    case 'loginFailed':
      return t('auth.errors.loginFailed');
    case 'captchaDemanded':
      return t('auth.errors.captchaDemanded');
    default:
      return exhaustiveCheck(error);
  }
};

export type ServerFailureTexts = {
  byField: Partial<Record<AuthField, string>>;
  form: Nullable<string>;
};

/**
 * A rejected request in the language of `t`: the server's errors under their field when the form has it, the rest at
 * the form level; an answer without any shows the fallback of the failure.
 */
export const serverFailureTexts = (failure: Nullable<ServerFailure>, t: Translate): ServerFailureTexts => {
  const byField: Partial<Record<AuthField, string>> = {};
  if (failure === null) {
    return { byField, form: null };
  }
  if (!(failure.error instanceof ApiRequestError)) {
    return { byField, form: authErrorText('unknown', t) };
  }
  const server = apiErrorTexts(failure.error, t);
  const formLevel = [...server.general];
  let underFields = 0;
  for (const [name, text] of Object.entries(server.byField)) {
    const field = failure.fields.find((candidate: AuthField) => candidate === name);
    if (field === undefined) {
      formLevel.push(text);
    } else {
      byField[field] = text;
      underFields += 1;
    }
  }
  if (formLevel.length > 0) {
    return { byField, form: formLevel.join(' ') };
  }
  return { byField, form: underFields === 0 ? authErrorText(failure.fallback, t) : null };
};
