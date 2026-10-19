import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { ErrorCode, ErrorParams } from '@common/constants';
import { CommonResponse, ErrorItemResponse } from '@common/dto';
import { toErrorBody } from '@common/functions';

export type ApiErrorItem = {
  code: ErrorCode;
  params?: ErrorParams;
  field?: string;
};

/** One way the endpoint fails: its errors, and the result code when it is not the plain error one. */
export type ApiErrorCase = ApiErrorItem[] | { errors: ApiErrorItem[]; resultCode: number };

type ApiErrorResultOptions = {
  status: HttpStatus;
  description: string;
  /** Named cases, each shown as an example of the envelope built from the error catalogue. */
  cases: Record<string, ApiErrorCase>;
};

const toExample = (errorCase: ApiErrorCase): CommonResponse.Dto => {
  const { errors, resultCode } = Array.isArray(errorCase) ? { errors: errorCase, resultCode: undefined } : errorCase;
  const items = errors.map(({ code, params, field }) => new ErrorItemResponse.Dto(code, params, field));
  return toErrorBody(items, resultCode);
};

/** Documents an error response of an endpoint: the envelope schema and one example per case, with real codes. */
export const ApiErrorResult = (options: ApiErrorResultOptions): MethodDecorator & ClassDecorator => {
  const examples = Object.fromEntries(
    Object.entries(options.cases).map(([name, errorCase]) => [name, { value: toExample(errorCase) }]),
  );

  return applyDecorators(
    ApiExtraModels(CommonResponse.Swagger.CommonResponseDto),
    ApiResponse({
      status: options.status,
      description: options.description,
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(CommonResponse.Swagger.CommonResponseDto) },
          examples,
        },
      },
    }),
  );
};

/** The cases every guarded or id-addressed endpoint shares. */
export const ApiErrorCases = {
  UNAUTHORIZED: { notSignedIn: [{ code: 'UNAUTHORIZED' }] },
  NOT_FOUND: { notFound: [{ code: 'NOT_FOUND' }] },
} satisfies Record<string, Record<string, ApiErrorCase>>;
