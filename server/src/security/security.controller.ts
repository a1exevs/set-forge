import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SecurityService } from '@security/security.service';
import { CommonResponse } from '@common/dto';
import { ResponseInterceptor } from '@common/interceptors';
import { Isession } from '@auth/interfaces';
import { Routes, Docs } from '@common/constants';

@ApiTags(Docs.ru.SECURITY_CONTROLLER)
@Controller(Routes.ENDPOINT_SECURITY)
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @ApiOperation({ summary: Docs.ru.GET_CAPTCHA_URL_ENDPOINT })
  @ApiOkResponse({ type: CommonResponse.Swagger.CommonResponseDto })
  @UseInterceptors(ResponseInterceptor)
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
