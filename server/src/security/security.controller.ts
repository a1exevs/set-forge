import { Controller, Get, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Isession } from '@auth/interfaces';
import { Docs, Routes } from '@common/constants';
import { CommonResponse } from '@common/dto';
import { SecurityService } from '@security/security.service';

@ApiTags(Docs.SECURITY_CONTROLLER)
@Controller(Routes.ENDPOINT_SECURITY)
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @ApiOperation({ summary: Docs.GET_CAPTCHA_URL_ENDPOINT })
  @ApiOkResponse({ type: CommonResponse.Swagger.CommonResponseDto })
  @Get('get-captcha-url')
  async getCaptchaURL(@Req() request) {
    const { captchaURL, captchaText } = await this.securityService.getCaptchaURL();
    SecurityController.setSessionCaptchaText(request, captchaText);
    return { captchaURL };
  }

  private static setSessionCaptchaText(request, captchaText: string) {
    const session: Isession = request.session;
    session.captcha = captchaText;
  }
}
