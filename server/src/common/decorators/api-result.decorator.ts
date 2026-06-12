import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

import { CommonResponse } from '@common/dto';

interface ApiResultOptions {
  type: Function;
  description?: string;
  status?: number;
}

export const ApiResult = (options: ApiResultOptions) => {
  return applyDecorators(
    ApiExtraModels(CommonResponse.Swagger.CommonResponseDto, options.type),
    ApiResponse({
      description: options?.description,
      status: options?.status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(CommonResponse.Swagger.CommonResponseDto) },
          {
            properties: {
              data: {
                type: 'object',
                allOf: [
                  {
                    $ref: getSchemaPath(options?.type),
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  );
};
