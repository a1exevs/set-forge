import { Test, TestingModule } from '@nestjs/testing';
import * as svgCaptcha from 'svg-captcha';

import { SecurityService } from '@security/security.service';

jest.mock('svg-captcha');

describe('SecurityService', () => {
  let securityService: SecurityService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [SecurityService],
    }).compile();
    securityService = moduleRef.get<SecurityService>(SecurityService);
  });

  describe('SecurityService - definition', () => {
    it('SecurityService - should be defined', () => {
      expect(securityService).toBeDefined();
    });
  });

  describe('SecurityService - getCaptchaURL', () => {
    it('should return a data URL and captcha text', () => {
      const captchaText = '1234';
      const captchaData = '<svg>captcha</svg>';
      const captcha = { text: captchaText, data: captchaData };
      jest.spyOn(svgCaptcha, 'create').mockImplementation(() => captcha);

      const result = securityService.getCaptchaURL();

      expect(result.captchaText).toBe(captchaText);
      expect(result.captchaURL).toBe(`data:image/svg+xml;base64,${Buffer.from(captchaData).toString('base64')}`);
      expect(svgCaptcha.create).toBeCalledTimes(1);
    });
  });
});
