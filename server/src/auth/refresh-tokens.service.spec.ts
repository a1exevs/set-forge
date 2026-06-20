import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';

import { RefreshToken } from '@auth/refresh-tokens.model';
import { RefreshTokensService } from '@auth/refresh-tokens.service';
import { User } from '@users/users.model';

jest.mock('./refresh-tokens.model');

interface IMockUser {
  id: number;
  email: string;
  roles: [
    {
      id: number;
      value: string;
      description: string;
    },
  ];
}

interface IMockRefreshToken {
  uuid: string;
  userId: number;
  isRevoked: boolean;
  expires: Date;
}

const getMockUser = (): IMockUser => {
  return {
    id: 1,
    email: 'user@yandex.ru',
    roles: [
      {
        id: 2,
        value: 'user',
        description: 'User role',
      },
    ],
  };
};

const getMockRefreshToken = (): IMockRefreshToken => {
  return {
    uuid: 'sdfsdf',
    userId: 1,
    isRevoked: false,
    expires: new Date(),
  };
};

describe('RefreshTokensService', () => {
  let refreshTokensService: RefreshTokensService;
  let model: typeof RefreshToken;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();

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
    it('should be successful result', async () => {
      const mockUser = getMockUser() as unknown as User;
      const ttl = 24 * 60 * 60 * 1000;
      jest.spyOn(RefreshToken, 'count').mockImplementation(() => {
        return Promise.resolve(2);
      });
      const saveFn = jest.spyOn(RefreshToken.prototype, 'save').mockImplementation(async () => {
        return saveFn.mock.instances[0];
      });
      const token = await refreshTokensService.createRefreshToken(mockUser, ttl);
      expect(token.userId).toBe(mockUser.id);
      expect(token.isRevoked).toBe(false);
      expect(saveFn).toBeCalledTimes(1);
    });
  });

  describe('RefreshTokensService - findTokenByUUId', () => {
    it('should be successful result', async () => {
      const mockToken = getMockRefreshToken();
      jest.spyOn(RefreshToken, 'findOne').mockImplementation(() => {
        return Promise.resolve(mockToken as RefreshToken);
      });

      const token = await refreshTokensService.findTokenByUUId(11);
      expect(token).toEqual(mockToken);
    });
  });

  describe('RefreshTokensService - findTokenByUUId', () => {
    it('should be successful result', async () => {
      const removedNumber = 1;
      const uuid = 1111;
      const params = { where: { uuid } };
      const destroyFn = jest.spyOn(RefreshToken, 'destroy').mockImplementation(async () => {
        return Promise.resolve(removedNumber);
      });

      const removed = await refreshTokensService.removeTokenByUUId(uuid);
      expect(removed).toEqual(removedNumber);
      expect(destroyFn).toBeCalledTimes(1);
      expect(destroyFn).toBeCalledWith(params);
    });
  });
});
