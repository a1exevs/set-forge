import { HttpStatus } from '@nestjs/common';

import { ResultCodes } from '@common/constants';
import { ApiErrorCases, ApiErrorResult } from '@common/decorators';
import { CommonResponse } from '@common/dto';

const DESCRIPTION = 'DESCRIPTION';

class TestClass {
  @ApiErrorResult({
    status: HttpStatus.UNAUTHORIZED,
    description: DESCRIPTION,
    cases: {
      invalidCredentials: [{ code: 'INVALID_EMAIL_OR_PASSWORD' }],
      wrongCaptcha: {
        errors: [{ code: 'NEED_AUTHORIZATION_WITH_CAPTCHA' }],
        resultCode: ResultCodes.NEED_CAPTCHA_AUTHORIZATION,
      },
    },
  })
  @ApiErrorResult({
    status: HttpStatus.BAD_REQUEST,
    description: DESCRIPTION,
    cases: { tooShort: [{ code: 'NUMERIC_MUST_NOT_BE_LESS_THAN_N', params: { min: 1 }, field: 'sets' }] },
  })
  @ApiErrorResult({ status: HttpStatus.NOT_FOUND, description: DESCRIPTION, cases: ApiErrorCases.NOT_FOUND })
  public testFunction(): string {
    return 'test';
  }
}

describe('ApiErrorResult', () => {
  const responses = Reflect.getMetadata('swagger/apiResponse', TestClass.prototype.testFunction);
  const examplesOf = (status: HttpStatus): Record<string, { value: CommonResponse.Dto }> =>
    responses[status].content['application/json'].examples;

  it('should document the envelope schema', () => {
    expect(Reflect.getMetadata('swagger/apiExtraModels', TestClass.prototype.testFunction)).toContain(
      CommonResponse.Swagger.CommonResponseDto,
    );
    expect(responses[HttpStatus.UNAUTHORIZED].description).toBe(DESCRIPTION);
    expect(responses[HttpStatus.UNAUTHORIZED].content['application/json'].schema).toEqual({
      $ref: '#/components/schemas/CommonResponseDto',
    });
  });

  it('should give one example per case, built from the catalogue', () => {
    expect(examplesOf(HttpStatus.BAD_REQUEST).tooShort.value).toEqual({
      data: null,
      messages: ['sets - Must not be less than 1'],
      fieldsErrors: [
        {
          code: 'NUMERIC_MUST_NOT_BE_LESS_THAN_N',
          params: { min: 1 },
          field: 'sets',
          message: 'Must not be less than 1',
        },
      ],
      resultCode: ResultCodes.ERROR,
    });
    expect(examplesOf(HttpStatus.NOT_FOUND).notFound.value.messages).toEqual(['Not found']);
  });

  it('should keep the result code of a case', () => {
    const examples = examplesOf(HttpStatus.UNAUTHORIZED);
    expect(examples.invalidCredentials.value.resultCode).toBe(ResultCodes.ERROR);
    expect(examples.wrongCaptcha.value.resultCode).toBe(ResultCodes.NEED_CAPTCHA_AUTHORIZATION);
  });
});
