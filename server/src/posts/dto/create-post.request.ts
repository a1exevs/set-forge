import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { ErrorMessages } from '@common/constants';

export namespace CreatePostRequest {
  export class Dto {
    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly title: string;

    @ApiProperty()
    @IsString({ message: ErrorMessages.ru.MUST_BE_A_STRING })
    readonly content: string;

    constructor(title, content) {
      this.title = title;
      this.content = content;
    }
  }

  export namespace Swagger {
    export class CreatePostRequestDto extends Dto {}
  }
}
