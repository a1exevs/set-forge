import { ForeignKeyConstraintError, Op } from 'sequelize';

import { hashOpaqueToken } from '@auth/opaque-token';
import { TrustedDevice } from '@auth/trusted-devices.model';
import { TRUSTED_DEVICE_LIFETIME_MS, TrustedDevicesService } from '@auth/trusted-devices.service';

jest.mock('./trusted-devices.model');

describe('TrustedDevicesService', () => {
  const service = new TrustedDevicesService();
  let count: jest.SpyInstance;
  let destroy: jest.SpyInstance;
  let upsert: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    count = jest.spyOn(TrustedDevice, 'count').mockResolvedValue(0 as never);
    destroy = jest.spyOn(TrustedDevice, 'destroy').mockResolvedValue(0);
    upsert = jest.spyOn(TrustedDevice, 'upsert').mockResolvedValue([{} as TrustedDevice, true]);
  });

  // @invariant session/trusted-device
  describe('isTrusted', () => {
    it('should look up the token hash for the user among the records not yet expired', async () => {
      count.mockResolvedValue(1 as never);
      const before = Date.now();

      await expect(service.isTrusted('device-token', 7)).resolves.toBe(true);

      const [options] = count.mock.calls[0];
      expect(options.where.userId).toBe(7);
      expect(options.where.tokenHash).toBe(hashOpaqueToken('device-token'));
      expect(options.where.expires[Op.gt].getTime()).toBeGreaterThanOrEqual(before);
    });

    it('should not trust a device without a live record for the account (expired, another account, none)', async () => {
      await expect(service.isTrusted('device-token', 7)).resolves.toBe(false);
    });

    it('should still run the lookup for an email that names no account, so it costs the same time', async () => {
      await expect(service.isTrusted('device-token', null)).resolves.toBe(false);

      expect(count).toHaveBeenCalledTimes(1);
      expect(count.mock.calls[0][0].where.userId).toBeNull();
    });

    it.each([[undefined], [''], [42], ['x'.repeat(129)]])(
      'should not trust a value that is no token of ours, without a lookup (%#)',
      async value => {
        await expect(service.isTrusted(value, 7)).resolves.toBe(false);
        expect(count).not.toHaveBeenCalled();
      },
    );
  });

  // @invariant session/trusted-device
  describe('trust', () => {
    it('should keep a known token and start its lifetime over', async () => {
      count.mockResolvedValue(1 as never);
      const before = Date.now();

      const trust = await service.trust(7, 'known-token');

      expect(trust?.token).toBe('known-token');
      expect(trust?.expires.getTime()).toBeGreaterThanOrEqual(before + TRUSTED_DEVICE_LIFETIME_MS);
      expect(upsert).toHaveBeenCalledWith({
        userId: 7,
        tokenHash: hashOpaqueToken('known-token'),
        expires: trust?.expires,
      });
    });

    it('should give a new token instead of one it has never issued, so a planted value is never trusted', async () => {
      const trust = await service.trust(7, 'planted-token');

      expect(trust?.token).not.toBe('planted-token');
      expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ tokenHash: hashOpaqueToken(trust?.token ?? '') }));
    });

    it('should give a new token to a device without one', async () => {
      const trust = await service.trust(7, undefined);

      expect(trust?.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    });

    it("should remove the user's expired records first", async () => {
      await service.trust(7, undefined);

      const [options] = destroy.mock.calls[0];
      expect(options.where.userId).toBe(7);
      expect(options.where.expires[Op.lte]).toBeInstanceOf(Date);
    });

    // @invariant session/deletion-during-sign-in
    it('should trust nothing when the user is gone by the time the record is stored', async () => {
      upsert.mockRejectedValue(new ForeignKeyConstraintError({}));

      await expect(service.trust(7, undefined)).resolves.toBeNull();
    });

    it('should let any other failure through', async () => {
      upsert.mockRejectedValue(new Error('connection lost'));

      await expect(service.trust(7, undefined)).rejects.toThrow('connection lost');
    });
  });
});
