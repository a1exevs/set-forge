import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as svgCaptcha from 'svg-captcha';

import { AppException } from '@common/exceptions';
import { CAPTCHA_LIFETIME_SECONDS, SecurityService } from '@security/security.service';
import { REDIS_CLIENT } from '@src/redis';

jest.mock('svg-captcha');

describe('SecurityService', () => {
  let securityService: SecurityService;
  let redis: { set: jest.Mock; getDel: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();
    redis = { set: jest.fn().mockResolvedValue('OK'), getDel: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [SecurityService, { provide: REDIS_CLIENT, useValue: redis }],
    }).compile();
    securityService = moduleRef.get<SecurityService>(SecurityService);
  });

  describe('SecurityService - createCaptcha', () => {
    it('should keep the answer for the captcha lifetime under a new id and return the image', async () => {
      const captchaData = '<svg>captcha</svg>';
      jest.spyOn(svgCaptcha, 'create').mockImplementation(() => ({ text: 'aB3d', data: captchaData }));

      const result = await securityService.createCaptcha();

      expect(result.captchaURL).toBe(`data:image/svg+xml;base64,${Buffer.from(captchaData).toString('base64')}`);
      expect(result.captchaId).toMatch(/^[0-9a-f-]{36}$/);
      expect(redis.set).toHaveBeenCalledWith(`captcha:${result.captchaId}`, 'aB3d', { EX: CAPTCHA_LIFETIME_SECONDS });
    });

    it('should give every captcha its own id', async () => {
      jest.spyOn(svgCaptcha, 'create').mockImplementation(() => ({ text: 'x', data: '<svg/>' }));

      const first = await securityService.createCaptcha();
      const second = await securityService.createCaptcha();

      expect(first.captchaId).not.toBe(second.captchaId);
    });

    it('should answer 503 SIGN_IN_TEMPORARILY_UNAVAILABLE when the store does not answer', async () => {
      jest.spyOn(svgCaptcha, 'create').mockImplementation(() => ({ text: 'x', data: '<svg/>' }));
      redis.set.mockRejectedValue(new Error('The client is closed'));

      await expect(securityService.createCaptcha()).rejects.toMatchObject({
        status: HttpStatus.SERVICE_UNAVAILABLE,
        errors: [expect.objectContaining({ code: 'SIGN_IN_TEMPORARILY_UNAVAILABLE' })],
      });
    });
  });

  describe('SecurityService - solvesCaptcha', () => {
    it('should accept the right answer and take it from the store in the same step', async () => {
      redis.getDel.mockResolvedValue('aB3d');

      await expect(securityService.solvesCaptcha('id-1', 'aB3d')).resolves.toBe(true);
      expect(redis.getDel).toHaveBeenCalledWith('captcha:id-1');
    });

    it('should refuse a wrong answer, and the captcha is spent all the same', async () => {
      redis.getDel.mockResolvedValue('aB3d');

      await expect(securityService.solvesCaptcha('id-1', 'abcd')).resolves.toBe(false);
      expect(redis.getDel).toHaveBeenCalledTimes(1);
    });

    it('should refuse an id the store no longer has — used, expired or never issued', async () => {
      redis.getDel.mockResolvedValue(null);

      await expect(securityService.solvesCaptcha('id-1', 'aB3d')).resolves.toBe(false);
    });

    it.each([
      [undefined, 'aB3d'],
      ['id-1', undefined],
      ['', ''],
    ])('should refuse without a lookup when the id or the answer is missing (%#)', async (captchaId, answer) => {
      await expect(securityService.solvesCaptcha(captchaId, answer)).resolves.toBe(false);
      expect(redis.getDel).not.toHaveBeenCalled();
    });

    it('should answer 503 when the store does not answer', async () => {
      redis.getDel.mockRejectedValue(new Error('The client is closed'));

      await expect(securityService.solvesCaptcha('id-1', 'aB3d')).rejects.toBeInstanceOf(AppException);
    });
  });
});
