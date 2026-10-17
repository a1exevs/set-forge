import { Min, validate } from 'class-validator';

import { validationError } from '@common/utils';

class Sample {
  @Min(1, validationError('NUMERIC_MUST_NOT_BE_LESS_THAN_N', { min: 1 }))
  readonly sets: number = 0;
}

describe('validationError', () => {
  it('should give the text and the code with params in the context', () => {
    expect(validationError('NUMERIC_MUST_NOT_BE_LESS_THAN_N', { min: 1 })).toEqual({
      message: 'Must not be less than 1',
      context: { code: 'NUMERIC_MUST_NOT_BE_LESS_THAN_N', params: { min: 1 } },
    });
  });

  it('should reach the ValidationError of class-validator', async () => {
    const [error] = await validate(new Sample());
    expect(error?.constraints).toEqual({ min: 'Must not be less than 1' });
    expect(error?.contexts).toEqual({ min: { code: 'NUMERIC_MUST_NOT_BE_LESS_THAN_N', params: { min: 1 } } });
  });
});
