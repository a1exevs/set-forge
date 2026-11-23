import { Injectable } from '@nestjs/common';
import { ForeignKeyConstraintError, Op } from 'sequelize';

import { hashOpaqueToken, newOpaqueToken } from '@auth/opaque-token';
import { TrustedDevice } from '@auth/trusted-devices.model';

/** session/trusted-device */
export const TRUSTED_DEVICE_LIFETIME_MS = 90 * 24 * 60 * 60 * 1000;

// Longer than any token this service issues: a longer value is not one of ours and is not even hashed.
const MAX_DEVICE_TOKEN_LENGTH = 128;

export type DeviceTrust = { readonly token: string; readonly expires: Date };

const asDeviceToken = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 && value.length <= MAX_DEVICE_TOKEN_LENGTH ? value : null;

/** The devices a user signed in on within the trust lifetime — session/trusted-device. */
@Injectable()
export class TrustedDevicesService {
  /**
   * Whether the device of the token is trusted for the user. Without a user the lookup still runs and finds nothing,
   * so a known email and an unknown one cost the same time.
   */
  public async isTrusted(deviceToken: unknown, userId: number | null): Promise<boolean> {
    const token = asDeviceToken(deviceToken);
    if (!token) {
      return false;
    }
    const found = await TrustedDevice.count({
      where: { userId, tokenHash: hashOpaqueToken(token), expires: { [Op.gt]: new Date() } },
    });
    return found > 0;
  }

  /**
   * Trusts the device for the user from now for the trust lifetime and gives the token for its cookie. The token of
   * the device is kept only when it is already known, so a value set from outside never becomes trusted. `null` when
   * the user no longer exists (session/deletion-during-sign-in).
   */
  public async trust(userId: number, deviceToken: unknown): Promise<DeviceTrust | null> {
    const presented = asDeviceToken(deviceToken);
    const known =
      presented !== null && (await TrustedDevice.count({ where: { tokenHash: hashOpaqueToken(presented) } })) > 0;
    const token = known && presented ? presented : newOpaqueToken();
    const expires = new Date(Date.now() + TRUSTED_DEVICE_LIFETIME_MS);

    await TrustedDevice.destroy({ where: { userId, expires: { [Op.lte]: new Date() } } });
    try {
      await TrustedDevice.upsert({ userId, tokenHash: hashOpaqueToken(token), expires } as TrustedDevice);
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError) {
        return null;
      }
      throw error;
    }
    return { token, expires };
  }
}
