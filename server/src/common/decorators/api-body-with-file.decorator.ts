import { ApiBody, ApiConsumes, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

interface ApiBodyWithFileOptions {
  body?: Function;
  fileFieldName: string;
}

export const ApiBodyWithFile = (options: ApiBodyWithFileOptions) => {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiExtraModels(options?.body || Function),
    ApiBody({
      schema: {
        allOf: [{ $ref: getSchemaPath(options?.body || Function) }],
        required: [options.fileFieldName],
        properties: {
          [options.fileFieldName]: {
            type: 'file',
            format: 'binary',
          },
        },
      },
    }),
  );
};
