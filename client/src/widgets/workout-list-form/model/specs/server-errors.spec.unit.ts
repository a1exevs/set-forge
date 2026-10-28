import { t as en } from 'tests/common/translate';

import { ApiRequestError } from '@shared/api';

import { formServerErrors } from '../server-errors';

describe('formServerErrors', () => {
  it('keeps the errors of the form fields and gives the rest to the page', () => {
    const error = new ApiRequestError(400, {
      data: null,
      messages: [],
      fieldsErrors: [
        { code: 'MUST_BE_A_STRING', params: {}, field: 'description', message: 'Must be a string' },
        { code: 'NUMERIC_MUST_NOT_BE_LESS_THAN_N', params: { min: 1 }, field: 'exercises.2.reps', message: '' },
        { code: 'MUST_BE_A_UUID', params: {}, field: 'exercises.0.id', message: 'Must be a UUID' },
        { code: 'BAD_REQUEST', params: {}, message: 'Bad request' },
      ],
      resultCode: 1,
    });

    expect(formServerErrors(error, en)).toEqual({
      fields: { description: 'Must be a string', 'exercises.2.reps': 'Must not be less than 1' },
      others: ['Bad request', 'Must be a UUID'],
    });
  });

  it('has nothing for an error that is not a failed request', () => {
    expect(formServerErrors(new Error('boom'), en)).toEqual({ fields: {}, others: [] });
  });
});
