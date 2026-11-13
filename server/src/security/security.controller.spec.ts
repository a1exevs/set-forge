import { Test, TestingModule } from '@nestjs/testing';

import { CaptchaResponse } from '@security/dto';
import { SecurityController } from '@security/security.controller';
import { SecurityService } from '@security/security.service';

describe('SecurityController', () => {
  let securityController: SecurityController;
  let securityService: { createCaptcha: jest.Mock };

  beforeEach(async () => {
    securityService = { createCaptcha: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [SecurityController],
      providers: [{ provide: SecurityService, useValue: securityService }],
    }).compile();
    securityController = moduleRef.get<SecurityController>(SecurityController);
  });

  describe('SecurityController - getCaptchaURL', () => {
    it('should answer the image and the id of a new captcha', async () => {
      securityService.createCaptcha.mockResolvedValue({ captchaURL: 'data:image/svg+xml;base64,', captchaId: 'id-1' });

      const result = await securityController.getCaptchaURL();

      expect(result).toEqual(new CaptchaResponse.Dto({ captchaURL: 'data:image/svg+xml;base64,', captchaId: 'id-1' }));
      expect(securityService.createCaptcha).toHaveBeenCalledTimes(1);
    });
  });
});
