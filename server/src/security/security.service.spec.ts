import { Test, TestingModule } from '@nestjs/testing';

import { SecurityService } from '@security/security.service';
import { FilesService } from '@files/files.service';

import * as svgCaptcha from 'svg-captcha';

jest.mock('svg-captcha');

describe('SecurityService', () => {
  let securityService: SecurityService;
  let filesService: FilesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityService,
        {
          provide: FilesService,
          useValue: {
            createFile: jest.fn(x => x),
            deleteFileWithTimer: jest.fn(x => x),
          },
        },
      ],
    }).compile();
    securityService = moduleRef.get<SecurityService>(SecurityService);
    filesService = moduleRef.get<FilesService>(FilesService);
  });

  describe('SecurityService - definition', () => {
    it('SecurityService - should be defined', () => {
      expect(securityService).toBeDefined();
    });
    it('FilesService - should be defined', () => {
      expect(filesService).toBeDefined();
    });
  });

  describe('SecurityService - getCaptchaURL', () => {
    it('should be successful result', async () => {
      const captchaText = '1234';
      const captchaData = 'svg-data';
      const filePath = 'filePath';
      const fileURL = 'fileURL';
      const captcha = { text: captchaText, data: captchaData };
      jest.spyOn(svgCaptcha, 'create').mockImplementation(() => {
        return captcha;
      });
      jest.spyOn(filesService, 'createFile').mockImplementation(() => {
        return Promise.resolve({ filePath, fileURL });
      });
      const result = await securityService.getCaptchaURL();
      expect(result.captchaText).toBe(captchaText);
      expect(result.captchaURL).toBe(fileURL);
      expect(svgCaptcha.create).toBeCalledTimes(1);
      expect(svgCaptcha.create).toReturnWith(captcha);
      expect(filesService.createFile).toBeCalledTimes(1);
      expect(filesService.createFile).toBeCalledWith({ buffer: captchaData }, '', 'svg', 'security/captcha');
      expect(filesService.deleteFileWithTimer).toBeCalledTimes(1);
      expect(filesService.deleteFileWithTimer).toBeCalledWith(filePath, 10);
    });
  });
});
