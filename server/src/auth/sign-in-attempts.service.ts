import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomUUID } from 'node:crypto';

import { AppException } from '@common/exceptions';
import { REDIS_CLIENT, RedisClient } from '@src/redis';

/** session/captcha-counts-login-only */
export const FAILED_SIGN_IN_WINDOW_MS = 15 * 60 * 1000;
export const CAPTCHA_AFTER_FAILS_PER_ACCOUNT_AND_ADDRESS = 5;
export const CAPTCHA_AFTER_FAILS_PER_ACCOUNT = 20;

// The commands `reserve` sends for one window, and where the count is among their replies.
const WINDOW_COMMANDS = 4;
const COUNT_REPLY = 2;

type Window = { readonly key: string; readonly threshold: number };

/** One sign-in attempt, counted before its outcome is known. */
export type SignInAttempt = {
  readonly accountAndAddressKey: string;
  /** `null` for a trusted device: the account-wide count does not apply to it (session/trusted-device). */
  readonly accountKey: string | null;
  readonly entry: string;
  /** The failures before this attempt reached a threshold: it may be checked only with a solved captcha. */
  readonly demandsCaptcha: boolean;
  /** Should this attempt fail, the next one demands the captcha. */
  readonly nextDemandsCaptcha: boolean;
};

/**
 * The failed sign-ins of an account, per address and across all, over a sliding window, kept in Redis whatever
 * cookies the client sends — session/captcha-counts-login-only. Keys are HMACs, so the store holds no email or
 * address.
 */
@Injectable()
export class SignInAttemptsService {
  private readonly secret: string;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
    config: ConfigService,
  ) {
    const secret = config.get<string>('SIGN_IN_LIMIT_SECRET_KEY');
    if (typeof secret !== 'string' || !secret.trim()) {
      throw new Error(
        'SIGN_IN_LIMIT_SECRET_KEY must be a non-empty string: add it to `server/.{NODE_ENV}.env` ' +
          '(see its `.example`) or to the environment.',
      );
    }
    this.secret = secret.trim();
  }

  /**
   * Counts the attempt as a failure up front, in one atomic step per window: of attempts that overlap only as many
   * reach the password as the thresholds allow. `succeeded` takes it back.
   */
  public async reserve(email: string, address: string, trustedDevice: boolean): Promise<SignInAttempt> {
    const account = SignInAttemptsService.normalizeEmail(email);
    const accountAndAddressKey = `sign-in:account-address:${this.pseudonym(`${account}\n${address}`)}`;
    const accountKey = trustedDevice ? null : `sign-in:account:${this.pseudonym(account)}`;
    const windows: Window[] = [{ key: accountAndAddressKey, threshold: CAPTCHA_AFTER_FAILS_PER_ACCOUNT_AND_ADDRESS }];
    if (accountKey) {
      windows.push({ key: accountKey, threshold: CAPTCHA_AFTER_FAILS_PER_ACCOUNT });
    }
    const now = Date.now();
    const entry = `${now}:${randomUUID()}`;

    const transaction = this.redis.multi();
    for (const { key } of windows) {
      transaction
        .zRemRangeByScore(key, 0, now - FAILED_SIGN_IN_WINDOW_MS)
        .zAdd(key, { score: now, value: entry })
        .zCard(key)
        .pExpire(key, FAILED_SIGN_IN_WINDOW_MS);
    }
    const replies = await SignInAttemptsService.whileAvailable(() => transaction.exec());
    const withThisOne = windows.map(({ threshold }: Window, index: number) => ({
      threshold,
      count: Number(replies[index * WINDOW_COMMANDS + COUNT_REPLY]),
    }));

    return {
      accountAndAddressKey,
      accountKey,
      entry,
      demandsCaptcha: withThisOne.some(({ count, threshold }) => count > threshold),
      nextDemandsCaptcha: withThisOne.some(({ count, threshold }) => count >= threshold),
    };
  }

  /**
   * The account and address start over; the account-wide count only loses this attempt, so a sign-in of the owner
   * never hands a guesser a fresh allowance.
   */
  public async succeeded(attempt: SignInAttempt): Promise<void> {
    const transaction = this.redis.multi().del(attempt.accountAndAddressKey);
    if (attempt.accountKey) {
      transaction.zRem(attempt.accountKey, attempt.entry);
    }
    await SignInAttemptsService.whileAvailable(() => transaction.exec());
  }

  private pseudonym(value: string): string {
    return createHmac('sha256', this.secret).update(value).digest('hex');
  }

  // Case and surrounding spaces do not make another account to count against.
  private static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  // The counts guard the sign-in, so without their store the sign-in is closed rather than left unguarded.
  private static async whileAvailable<T>(call: () => Promise<T>): Promise<T> {
    try {
      return await call();
    } catch (cause) {
      throw AppException.of(HttpStatus.SERVICE_UNAVAILABLE, 'SIGN_IN_TEMPORARILY_UNAVAILABLE', {}, cause as Error);
    }
  }
}
