import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import {
  CAPTCHA_AFTER_FAILS_PER_ACCOUNT,
  CAPTCHA_AFTER_FAILS_PER_ACCOUNT_AND_ADDRESS,
  FAILED_SIGN_IN_WINDOW_MS,
  SignInAttemptsService,
} from '@auth/sign-in-attempts.service';
import { REDIS_CLIENT } from '@src/redis';

type Call = [string, ...unknown[]];

/** A `multi()` that records its commands and answers `exec()` with the given replies. */
function fakeRedis(replies: () => unknown[]): { multi: jest.Mock; calls: Call[][] } {
  const calls: Call[][] = [];
  const multi = jest.fn(() => {
    const recorded: Call[] = [];
    calls.push(recorded);
    const chain = new Proxy({} as Record<string, unknown>, {
      get: (_, name: string) =>
        name === 'exec'
          ? async (): Promise<unknown[]> => replies()
          : (...args: unknown[]): unknown => {
              recorded.push([name, ...args]);
              return chain;
            },
    });
    return chain;
  });
  return { multi, calls };
}

describe('SignInAttemptsService', () => {
  let counts: { accountAndAddress: number; account: number };
  let redis: ReturnType<typeof fakeRedis>;

  async function create(secret = 'test-secret'): Promise<SignInAttemptsService> {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SignInAttemptsService,
        { provide: REDIS_CLIENT, useValue: redis },
        { provide: ConfigService, useValue: { get: (): string => secret } },
      ],
    }).compile();
    return moduleRef.get(SignInAttemptsService);
  }

  beforeEach(() => {
    counts = { accountAndAddress: 1, account: 1 };
    redis = fakeRedis(() => [0, 1, counts.accountAndAddress, true, 0, 1, counts.account, true]);
  });

  it('should refuse to start without its secret', async () => {
    await expect(create(' ')).rejects.toThrow('SIGN_IN_LIMIT_SECRET_KEY');
  });

  describe('reserve', () => {
    it('should add the attempt to both windows in one transaction, dropping entries older than the window', async () => {
      const service = await create();
      const before = Date.now();

      const attempt = await service.reserve('user@example.com', '203.0.113.7', false);

      expect(redis.multi).toHaveBeenCalledTimes(1);
      const [commands] = redis.calls;
      expect(commands?.map(([name]) => name)).toEqual([
        'zRemRangeByScore',
        'zAdd',
        'zCard',
        'pExpire',
        'zRemRangeByScore',
        'zAdd',
        'zCard',
        'pExpire',
      ]);
      const [, key, , upTo] = commands?.[0] ?? [];
      expect(key).toBe(attempt.accountAndAddressKey);
      expect(Number(upTo)).toBeGreaterThanOrEqual(before - FAILED_SIGN_IN_WINDOW_MS);
      expect(commands?.[1]).toEqual([
        'zAdd',
        attempt.accountAndAddressKey,
        expect.objectContaining({ value: attempt.entry }),
      ]);
      expect(commands?.[3]).toEqual(['pExpire', attempt.accountAndAddressKey, FAILED_SIGN_IN_WINDOW_MS]);
      expect(commands?.[5]).toEqual(['zAdd', attempt.accountKey, expect.objectContaining({ value: attempt.entry })]);
    });

    it('should keep no email or address in the keys', async () => {
      const service = await create();

      const attempt = await service.reserve('user@example.com', '203.0.113.7', false);

      expect(attempt.accountAndAddressKey).toMatch(/^sign-in:account-address:[0-9a-f]{64}$/);
      expect(attempt.accountKey).toMatch(/^sign-in:account:[0-9a-f]{64}$/);
    });

    it('should count an email in any case and with spaces against one account', async () => {
      const service = await create();

      const first = await service.reserve('User@Example.com ', '203.0.113.7', false);
      const second = await service.reserve('user@example.com', '203.0.113.7', false);

      expect(first.accountKey).toBe(second.accountKey);
      expect(first.accountAndAddressKey).toBe(second.accountAndAddressKey);
    });

    it('should count each address of an account apart and every address against the account', async () => {
      const service = await create();

      const first = await service.reserve('user@example.com', '203.0.113.7', false);
      const second = await service.reserve('user@example.com', '198.51.100.9', false);

      expect(first.accountAndAddressKey).not.toBe(second.accountAndAddressKey);
      expect(first.accountKey).toBe(second.accountKey);
    });

    it('should make other keys with another secret', async () => {
      const first = await (await create('one')).reserve('user@example.com', '203.0.113.7', false);
      const second = await (await create('two')).reserve('user@example.com', '203.0.113.7', false);

      expect(first.accountKey).not.toBe(second.accountKey);
    });

    it.each([
      ['under both thresholds', CAPTCHA_AFTER_FAILS_PER_ACCOUNT_AND_ADDRESS - 1, 1, false, false],
      ['reaching the account-and-address one', CAPTCHA_AFTER_FAILS_PER_ACCOUNT_AND_ADDRESS, 1, false, true],
      ['past the account-and-address one', CAPTCHA_AFTER_FAILS_PER_ACCOUNT_AND_ADDRESS + 1, 1, true, true],
      ['reaching the account-wide one', 1, CAPTCHA_AFTER_FAILS_PER_ACCOUNT, false, true],
      ['past the account-wide one', 1, CAPTCHA_AFTER_FAILS_PER_ACCOUNT + 1, true, true],
    ])(
      'should demand the captcha by the count with this attempt — %s',
      async (_, accountAndAddress, account, demandsCaptcha, nextDemandsCaptcha) => {
        counts = { accountAndAddress, account };
        const service = await create();

        const attempt = await service.reserve('user@example.com', '203.0.113.7', false);

        expect(attempt.demandsCaptcha).toBe(demandsCaptcha);
        expect(attempt.nextDemandsCaptcha).toBe(nextDemandsCaptcha);
      },
    );

    it('should answer 503 SIGN_IN_TEMPORARILY_UNAVAILABLE when the store does not answer', async () => {
      redis = fakeRedis(() => {
        throw new Error('The client is closed');
      });
      const service = await create();

      await expect(service.reserve('user@example.com', '203.0.113.7', false)).rejects.toMatchObject({
        status: HttpStatus.SERVICE_UNAVAILABLE,
        errors: [expect.objectContaining({ code: 'SIGN_IN_TEMPORARILY_UNAVAILABLE' })],
      });
    });
  });

  // @invariant session/trusted-device
  describe('reserve on a trusted device', () => {
    it('should count only the account and address, leaving the account-wide window untouched', async () => {
      const service = await create();

      const attempt = await service.reserve('user@example.com', '203.0.113.7', true);

      expect(attempt.accountKey).toBeNull();
      expect(redis.calls[0]?.map(([name, key]) => [name, key])).toEqual([
        ['zRemRangeByScore', attempt.accountAndAddressKey],
        ['zAdd', attempt.accountAndAddressKey],
        ['zCard', attempt.accountAndAddressKey],
        ['pExpire', attempt.accountAndAddressKey],
      ]);
    });

    it('should not demand the captcha for the account-wide threshold', async () => {
      counts = { accountAndAddress: 1, account: CAPTCHA_AFTER_FAILS_PER_ACCOUNT + 10 };
      redis = fakeRedis(() => [0, 1, counts.accountAndAddress, true]);
      const service = await create();

      const attempt = await service.reserve('user@example.com', '203.0.113.7', true);

      expect(attempt.demandsCaptcha).toBe(false);
      expect(attempt.nextDemandsCaptcha).toBe(false);
    });

    it('should still demand it for the account and address threshold', async () => {
      redis = fakeRedis(() => [0, 1, CAPTCHA_AFTER_FAILS_PER_ACCOUNT_AND_ADDRESS + 1, true]);
      const service = await create();

      const attempt = await service.reserve('user@example.com', '203.0.113.7', true);

      expect(attempt.demandsCaptcha).toBe(true);
    });

    it('should start only the account and address over after a sign-in', async () => {
      const service = await create();
      const attempt = await service.reserve('user@example.com', '203.0.113.7', true);

      await service.succeeded(attempt);

      expect(redis.calls[1]).toEqual([['del', attempt.accountAndAddressKey]]);
    });
  });

  describe('succeeded', () => {
    it('should start the account and address over and take only this attempt from the account', async () => {
      const service = await create();
      const attempt = await service.reserve('user@example.com', '203.0.113.7', false);

      await service.succeeded(attempt);

      expect(redis.calls[1]).toEqual([
        ['del', attempt.accountAndAddressKey],
        ['zRem', attempt.accountKey, attempt.entry],
      ]);
    });
  });
});
