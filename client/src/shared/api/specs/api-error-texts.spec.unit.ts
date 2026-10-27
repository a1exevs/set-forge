import i18next from 'i18next';

import type { ApiErrorItem } from '../api-error';
import { apiErrorText, apiErrorTexts } from '../api-error-texts';
import { ApiRequestError } from '../http-client';

const failed = (errors: ApiErrorItem[]): ApiRequestError =>
  new ApiRequestError(400, {
    data: null,
    messages: errors.map(item => item.message),
    fieldsErrors: errors,
    resultCode: 1,
  });

const en = i18next.getFixedT('en');
const ru = i18next.getFixedT('ru');

describe('apiErrorTexts', () => {
  // @invariant session/server-errors-in-language
  describe('shows a server error in the chosen language by its code', () => {
    const error = failed([{ code: 'INVALID_EMAIL_OR_PASSWORD', params: {}, message: 'Invalid email or password' }]);

    it('in English', () => {
      expect(apiErrorTexts(error, en).general).toEqual(['Invalid email or password']);
    });

    it('in Russian', () => {
      expect(apiErrorTexts(error, ru).general).toEqual(['Неверная электронная почта или пароль']);
    });

    it('keeps the English text of a code the client does not know', () => {
      const unknown = failed([{ code: 'SOMETHING_NEW', params: {}, message: 'Something new happened' }]);
      expect(apiErrorTexts(unknown, ru).general).toEqual(['Something new happened']);
    });
  });

  it('substitutes the params in both languages', () => {
    const error = failed([
      {
        code: 'STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N',
        params: { min: 8, max: 50 },
        field: 'password',
        message: 'Length must be greater than 8 and less than 50 characters',
      },
    ]);

    expect(apiErrorTexts(error, en).byField).toEqual({
      password: 'Length must be greater than 8 and less than 50 characters',
    });
    expect(apiErrorTexts(error, ru).byField).toEqual({ password: 'Длина должна быть от 8 до 50 символов' });
  });

  it('splits field errors from the general ones and keeps the first error of a field', () => {
    const error = failed([
      { code: 'MUST_BE_A_STRING', params: {}, field: 'exercises.0.name', message: 'Must be a string' },
      { code: 'NUMERIC_MUST_NOT_BE_LESS_THAN_N', params: { min: 1 }, field: 'exercises.0.sets', message: '' },
      { code: 'MUST_BE_AN_INTEGER_NUMBER', params: {}, field: 'exercises.0.sets', message: '' },
      { code: 'USER_ALREADY_EXISTS', params: {}, message: 'User already exists' },
    ]);

    expect(apiErrorTexts(error, en)).toEqual({
      byField: { 'exercises.0.name': 'Must be a string', 'exercises.0.sets': 'Must not be less than 1' },
      general: ['User already exists'],
    });
  });

  it('gives no texts for an error that is not a failed request', () => {
    expect(apiErrorTexts(new Error('boom'), en)).toEqual({ byField: {}, general: [] });
  });
});

describe('apiErrorText', () => {
  it('joins every error of a failed request into one line', () => {
    const error = failed([
      { code: 'NOT_FOUND', params: {}, message: 'Not found' },
      { code: 'MUST_BE_A_UUID', params: {}, field: 'workoutListId', message: 'Must be a UUID' },
    ]);
    expect(apiErrorText(error, en)).toBe('Not found Must be a UUID');
  });

  it('is null without errors to show', () => {
    expect(apiErrorText(new Error('boom'), en)).toBeNull();
  });
});
