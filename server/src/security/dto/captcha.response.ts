import { ApiProperty } from '@nestjs/swagger';

export namespace CaptchaResponse {
  export class Dto {
    @ApiProperty({ example: 'data:image/svg+xml;base64,PHN2Zz4uLi48L3N2Zz4=', description: 'The captcha image' })
    readonly captchaURL: string;

    @ApiProperty({
      example: '0b6d3c2e-6f6a-4c55-9a43-2f6f3b5b1c7e',
      description: 'Sent back with the answer at sign-in',
    })
    readonly captchaId: string;

    constructor(dto: Dto) {
      this.captchaURL = dto.captchaURL;
      this.captchaId = dto.captchaId;
    }
  }

  export namespace Swagger {
    export class CaptchaResponseDto extends Dto {}
  }
}
