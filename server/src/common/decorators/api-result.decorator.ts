import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { CommonResponse } from '@common/dto';

interface ApiResultOptions {
  type: Function;
  description?: string;
  status?: number;
  nullable?: boolean;
}

export const ApiResult = (options: ApiResultOptions) => {
  const dataSchema = options.nullable
    ? {
        nullable: true,
        allOf: [{ $ref: getSchemaPath(options.type) }],
      }
    : {
        type: 'object',
        allOf: [{ $ref: getSchemaPath(options.type) }],
      };

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
              data: dataSchema,
            },
          },
        ],
      },
    }),
  );
};
