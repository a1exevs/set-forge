import { t } from 'tests/common/translate';

import { type ApiErrorItem, ApiRequestError } from '@shared/api';

import { authErrorText, serverFailureTexts } from '../auth-error-texts';

const rejected = (errors: ApiErrorItem[]): ApiRequestError =>
  new ApiRequestError(400, { data: null, messages: [], fieldsErrors: errors, resultCode: 1 });

describe('authErrorText', () => {
  it('names each code of the form', () => {
    expect(authErrorText('emailRequired', t)).toBe('Email is required');
    expect(authErrorText('passwordsMismatch', t)).toBe('Passwords do not match');
    expect(authErrorText('captchaNeeded', t)).toBe('Captcha required');
  });
});

describe('serverFailureTexts', () => {
  it('shows nothing without a failure', () => {
    expect(serverFailureTexts(null, t)).toEqual({ byField: {}, form: null });
  });

  it('says something went wrong for a failure that is not an answer of the server', () => {
    const failure = { error: new Error('offline'), fields: ['email'] as const, fallback: 'loginFailed' as const };

    expect(serverFailureTexts(failure, t)).toEqual({ byField: {}, form: 'Something went wrong' });
  });

  it('puts an error under a field of the form and the rest at the form level, general ones first', () => {
    const failure = {
      error: rejected([
        { code: 'MUST_BE_A_STRING', params: {}, field: 'email', message: 'Must be a string' },
        { code: 'MUST_BE_A_STRING', params: {}, field: 'nickname', message: 'Must be a string' },
        { code: 'SOMETHING_NEW', params: {}, message: 'Something new happened' },
      ]),
      fields: ['email', 'password'] as const,
      fallback: 'loginFailed' as const,
    };

    expect(serverFailureTexts(failure, t)).toEqual({
      byField: { email: 'Must be a string' },
      form: 'Something new happened Must be a string',
    });
  });

  it('shows the fallback when the answer names no error', () => {
    const failure = { error: rejected([]), fields: ['email'] as const, fallback: 'registrationFailed' as const };

    expect(serverFailureTexts(failure, t)).toEqual({ byField: {}, form: 'Registration failed' });
  });
});
