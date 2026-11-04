import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Op } from 'sequelize';

import { RefreshToken } from '@auth/refresh-tokens.model';
import { MAX_SIGNED_IN_DEVICES, RefreshTokensService } from '@auth/refresh-tokens.service';

jest.mock('./refresh-tokens.model');

const TOKEN_HASH = 'a'.repeat(64);
const TTL = 24 * 60 * 60 * 1000;

/** The user's active records as the model returns them, the soonest to expire first. */
const activeRecords = (count: number): RefreshToken[] =>
  Array.from({ length: count }, (_, index) => ({ uuid: `uuid-${index + 1}` }) as RefreshToken);

const mockStore = (activeCount: number): { destroyFn: jest.SpyInstance; findAllFn: jest.SpyInstance } => {
  const destroyFn = jest.spyOn(RefreshToken, 'destroy').mockResolvedValue(0);
  const findAllFn = jest.spyOn(RefreshToken, 'findAll').mockResolvedValue(activeRecords(activeCount));
  const saveFn = jest.spyOn(RefreshToken.prototype, 'save').mockImplementation(async () => saveFn.mock.instances[0]);
  return { destroyFn, findAllFn };
};

describe('RefreshTokensService', () => {
  let refreshTokensService: RefreshTokensService;
  let model: typeof RefreshToken;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokensService,
        {
          provide: getModelToken(RefreshToken),
          useValue: {},
        },
      ],
    }).compile();
    refreshTokensService = module.get<RefreshTokensService>(RefreshTokensService);
    model = module.get<typeof RefreshToken>(getModelToken(RefreshToken));
  });

  describe('RefreshTokensService - definition', () => {
    it('RefreshTokensService - should be defined', () => {
      expect(refreshTokensService).toBeDefined();
    });
    it('RefreshToken - should be defined', () => {
      expect(model).toBeDefined();
    });
  });

  describe('RefreshTokensService - createRefreshToken', () => {
    it('should store the hash for the user with the expiry ttl from now', async () => {
      mockStore(2);
      const before = Date.now();

      const token = await refreshTokensService.createRefreshToken(1, TOKEN_HASH, TTL);

      expect(token.userId).toBe(1);
      expect(token.tokenHash).toBe(TOKEN_HASH);
      expect(token.expires.getTime()).toBeGreaterThanOrEqual(before + TTL);
      expect(token.expires.getTime()).toBeLessThanOrEqual(Date.now() + TTL);
      expect(RefreshToken.prototype.save).toBeCalledTimes(1);
    });
    it("should remove the user's expired records first", async () => {
      const { destroyFn, findAllFn } = mockStore(0);

      await refreshTokensService.createRefreshToken(1, TOKEN_HASH, TTL);

      expect(destroyFn).toBeCalledTimes(1);
      expect(destroyFn).toBeCalledWith({ where: { userId: 1, expires: { [Op.lte]: expect.any(Date) } } });
      expect(destroyFn.mock.invocationCallOrder[0]).toBeLessThan(findAllFn.mock.invocationCallOrder[0]);
    });
    // @invariant session/signed-in-devices
    it('should keep every other device while the user is under the limit', async () => {
      const { destroyFn } = mockStore(MAX_SIGNED_IN_DEVICES - 1);

      await refreshTokensService.createRefreshToken(1, TOKEN_HASH, TTL);

      expect(destroyFn).toBeCalledTimes(1);
      expect(RefreshToken.findAll).toBeCalledWith(
        expect.objectContaining({ where: { userId: 1 }, order: [['expires', 'ASC']] }),
      );
    });
    // @invariant session/signed-in-devices
    it('should end only the device that refreshed least recently at the limit', async () => {
      const { destroyFn } = mockStore(MAX_SIGNED_IN_DEVICES);

      await refreshTokensService.createRefreshToken(1, TOKEN_HASH, TTL);

      expect(destroyFn).toBeCalledTimes(2);
      expect(destroyFn).toHaveBeenLastCalledWith({ where: { uuid: ['uuid-1'] } });
      expect(RefreshToken.prototype.save).toBeCalledTimes(1);
    });
    it('should trim back to the limit when concurrent sign-ins left more records', async () => {
      const { destroyFn } = mockStore(MAX_SIGNED_IN_DEVICES + 1);

      await refreshTokensService.createRefreshToken(1, TOKEN_HASH, TTL);

      expect(destroyFn).toHaveBeenLastCalledWith({ where: { uuid: ['uuid-1', 'uuid-2'] } });
    });
  });

  describe('RefreshTokensService - findTokenByHash', () => {
    it('should look the record up by its hash', async () => {
      const stored = { tokenHash: TOKEN_HASH } as RefreshToken;
      const findOneFn = jest.spyOn(RefreshToken, 'findOne').mockResolvedValue(stored);

      const token = await refreshTokensService.findTokenByHash(TOKEN_HASH);

      expect(token).toBe(stored);
      expect(findOneFn).toBeCalledWith({ where: { tokenHash: TOKEN_HASH } });
    });
  });

  describe('RefreshTokensService - removeTokenByHash', () => {
    it('should remove the record by its hash', async () => {
      const destroyFn = jest.spyOn(RefreshToken, 'destroy').mockResolvedValue(1);

      const removed = await refreshTokensService.removeTokenByHash(TOKEN_HASH);

      expect(removed).toBe(1);
      expect(destroyFn).toBeCalledWith({ where: { tokenHash: TOKEN_HASH } });
    });
  });
});
