import { Test, TestingModule } from '@nestjs/testing';
import { createRequest } from 'node-mocks-http';

import { SecurityController } from '@security/security.controller';
import { SecurityService } from '@security/security.service';
import { ResponseInterceptor } from '@common/interceptors';

describe('SecurityController', () => {
  let securityController: SecurityController;
  let securityService: SecurityService;
  let responseInterceptor: ResponseInterceptor<any>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [SecurityController],
      providers: [
        {
          provide: SecurityService,
          useValue: {
            getCaptchaURL: jest.fn(x => x),
          },
        },
      ],
    }).compile();
    securityController = moduleRef.get<SecurityController>(SecurityController);
    securityService = moduleRef.get<SecurityService>(SecurityService);
    responseInterceptor = moduleRef.get<ResponseInterceptor<any>>(ResponseInterceptor);
  });

  describe('SecurityController - definition', () => {
    it('SecurityController - should be defined', () => {
      expect(securityController).toBeDefined();
    });
    it('SecurityService - should be defined', () => {
      expect(securityService).toBeDefined();
    });
    it('ResponseInterceptor - should be defined', () => {
      expect(responseInterceptor).toBeDefined();
    });
  });

  describe('SecurityController - getCaptchaURL', () => {
    it('should be successful result', async () => {
      const request = createRequest();
      const captchaURL = 'sawa.com/captcha';
      const captchaText = '1234';
      request._setSessionVariable('captcha', '');
      jest.spyOn(securityService, 'getCaptchaURL').mockImplementation(() => {
        return Promise.resolve({ captchaURL, captchaText });
      });
      const result = await securityController.getCaptchaURL(request);

      expect(result.captchaURL).toBe(captchaURL);
      expect(request.session['captcha']).toBe(captchaText);
      expect(securityService.getCaptchaURL).toBeCalledTimes(1);
    });
  });
});
