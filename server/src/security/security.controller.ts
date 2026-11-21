import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Docs, Routes } from '@common/constants';
import { ApiErrorResult, ApiResult } from '@common/decorators';
import { CaptchaResponse } from '@security/dto';
import { SecurityService } from '@security/security.service';

@ApiTags(Docs.SECURITY_CONTROLLER)
@Controller(Routes.ENDPOINT_SECURITY)
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @ApiOperation({ summary: Docs.GET_CAPTCHA_URL_ENDPOINT })
  @ApiResult({
    status: 200,
    type: CaptchaResponse.Swagger.CaptchaResponseDto,
    description: Docs.GET_CAPTCHA_URL_SUCCESSFUL_RESULT,
  })
  @ApiErrorResult({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: Docs.SIGN_IN_SERVICE_UNAVAILABLE,
    cases: { storeUnavailable: [{ code: 'SIGN_IN_TEMPORARILY_UNAVAILABLE' }] },
  })
  @Get('get-captcha-url')
  async getCaptchaURL(): Promise<CaptchaResponse.Dto> {
    return new CaptchaResponse.Dto(await this.securityService.createCaptcha());
  }
}
