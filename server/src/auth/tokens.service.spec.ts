import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import { HttpStatus } from '@nestjs/common';

import { TokensService } from '@auth/tokens.service';
import { RefreshTokensService } from '@auth/refresh-tokens.service';
import { UsersService } from '@users/users.service';
import { sendPseudoError } from '@test/unit/helpers';
import { ErrorMessages } from '@common/constants';
import { User } from '@users/users.model';
import { RefreshToken } from '@auth/refresh-tokens.model';

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

interface IAccessTokenOptions {
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  sub: string;
}

interface IRefreshTokenOptions extends IAccessTokenOptions {
  jti: string;
}

interface IMockRefreshToken {
  isRevoked: boolean;
}

interface IAccessTokenVerifyResult extends IMockUser, IAccessTokenOptions {}
type IRefreshTokenVerifyResult = IRefreshTokenOptions;

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
    isRevoked: false,
  };
};

interface IGetRefreshTokenGeneratedData {
  jwtService: JwtService;
  expiresIn: number;
  withoutSubject?: boolean;
  withoutJwtId?: boolean;
}

const getRefreshTokenGeneratedData = (params: IGetRefreshTokenGeneratedData) => {
  const mockUser = getMockUser() as unknown as User;
  const tokenUUID = 'sdfsdf';
  const opts: SignOptions = {
    expiresIn: params.expiresIn,
  };
  if (!params.withoutSubject) opts.subject = String(mockUser.id);
  if (!params.withoutJwtId) opts.jwtid = String(tokenUUID);
  const refreshToken = params.jwtService.sign({}, opts);
  return {
    refreshToken,
    mockUser,
    tokenUUID,
  };
};

describe('TokensService', () => {
  let tokensService: TokensService;
  let userService: UsersService;
  let jwtService: JwtService;
  let refreshTokensService: RefreshTokensService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        {
          provide: UsersService,
          useValue: {
            getUserByEmail: jest.fn(x => x),
            getUserById: jest.fn(x => x),
            createUser: jest.fn(x => x),
          },
        },
        {
          provide: RefreshTokensService,
          useValue: {
            createRefreshToken: jest.fn(x => x),
            findTokenByUUId: jest.fn(x => x),
            removeTokenByUUId: jest.fn(x => x),
          },
        },
      ],
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET_KEY || 'SECRET',
          signOptions: {
            expiresIn: '600s',
          },
        }),
      ],
    }).compile();

    tokensService = module.get<TokensService>(TokensService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokensService = module.get<RefreshTokensService>(RefreshTokensService);
  });

  describe('TokensService - definition', () => {
    it('TokensService - should be defined', () => {
      expect(tokensService).toBeDefined();
    });
    it('UsersService - should be defined', () => {
      expect(userService).toBeDefined();
    });
    it('JwtService - should be defined', () => {
      expect(jwtService).toBeDefined();
    });
    it('RefreshTokensService - should be defined', () => {
      expect(refreshTokensService).toBeDefined();
    });
  });

  describe('TokensService - generateAccessToken', () => {
    it('GenerateAccessToken method - should be successful result', async () => {
      const mockUser = getMockUser() as unknown as User;
      const token = await tokensService.generateAccessToken(mockUser);
      const payload: IAccessTokenVerifyResult = jwtService.verify(token);

      expect(payload.id).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.roles).not.toBeUndefined();
      expect(payload.sub).toBe(`${mockUser.id}`);
      expect(payload.aud).not.toBeUndefined();
      expect(payload.iss).not.toBeUndefined();
    });
  });

  describe('TokensService - generateRefreshToken', () => {
    it('GenerateRefreshToken method - should be successful result', async () => {
      const tokenUUID = 'sdfsdfsfsf';
      const expiresIn = TokensService.getRefreshTokenExpiresIn();
      const mockUser = getMockUser() as unknown as User;
      jest.spyOn(refreshTokensService, 'createRefreshToken').mockImplementation(async () => {
        return Promise.resolve({ uuid: tokenUUID } as RefreshToken);
      });

      const token = await tokensService.generateRefreshToken(mockUser, expiresIn);
      const payload: IRefreshTokenVerifyResult = jwtService.verify(token);

      expect(payload.sub).toBe(`${mockUser.id}`);
      expect(payload.aud).not.toBeUndefined();
      expect(payload.iss).not.toBeUndefined();
      expect(payload.jti).toBe(tokenUUID);
      expect(payload.exp - payload.iat).toBe(expiresIn);
    });
  });

  describe('TokensService - updateAccessRefreshTokensFromRefreshToken', () => {
    it('UpdateAccessRefreshTokensFromRefreshToken method - should be successful result', async () => {
      const { refreshToken, mockUser, tokenUUID } = getRefreshTokenGeneratedData({
        jwtService,
        expiresIn: TokensService.getRefreshTokenExpiresIn(),
      });

      jest.spyOn(refreshTokensService, 'findTokenByUUId').mockImplementation(async () => {
        return Promise.resolve(getMockRefreshToken() as RefreshToken);
      });
      jest.spyOn(refreshTokensService, 'removeTokenByUUId').mockImplementation(async () => {
        return Promise.resolve(1);
      });
      jest.spyOn(userService, 'getUserById').mockImplementation(async () => {
        return Promise.resolve(mockUser);
      });
      jest.spyOn(refreshTokensService, 'createRefreshToken').mockImplementation(async () => {
        return Promise.resolve({ uuid: tokenUUID } as RefreshToken);
      });
      jest.spyOn(tokensService, 'removeRefreshToken');
      jest.spyOn(tokensService, 'generateRefreshToken');
      jest.spyOn(tokensService, 'generateAccessToken');

      const result = await tokensService.updateAccessRefreshTokensFromRefreshToken(refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toEqual(mockUser);
      expect(refreshTokensService.findTokenByUUId).toBeCalledTimes(1);
      expect(refreshTokensService.findTokenByUUId).toBeCalledWith(tokenUUID);
      expect(refreshTokensService.removeTokenByUUId).toBeCalledTimes(1);
      expect(refreshTokensService.removeTokenByUUId).toBeCalledWith(tokenUUID);
      expect(tokensService.removeRefreshToken).toBeCalledTimes(1);
      expect(tokensService.removeRefreshToken).toBeCalledWith(refreshToken);
      expect(userService.getUserById).toBeCalledTimes(1);
      expect(userService.getUserById).toBeCalledWith(`${mockUser.id}`);
      expect(tokensService.generateRefreshToken).toBeCalledTimes(1);
      expect(tokensService.generateRefreshToken).toBeCalledWith(mockUser, TokensService.getRefreshTokenExpiresIn());
      expect(refreshTokensService.createRefreshToken).toBeCalledTimes(1);
      expect(refreshTokensService.createRefreshToken).toBeCalledWith(
        mockUser,
        TokensService.getRefreshTokenExpiresIn(),
      );
      expect(tokensService.generateAccessToken).toBeCalledTimes(1);
      expect(tokensService.generateAccessToken).toBeCalledWith(mockUser);
    });
    it('UpdateAccessRefreshTokensFromRefreshToken method - should be unsuccessful result (token expired)', async () => {
      const expiresIn = 5000;
      const { refreshToken } = getRefreshTokenGeneratedData({
        jwtService,
        expiresIn,
      });
      jest.spyOn(tokensService, 'removeRefreshToken');
      jest.spyOn(tokensService, 'generateRefreshToken');
      jest.spyOn(tokensService, 'generateAccessToken');
      jest.useFakeTimers();
      expect.assertions(5);
      setTimeout(async () => {
        try {
          await tokensService.updateAccessRefreshTokensFromRefreshToken(refreshToken);
          sendPseudoError();
        } catch (err) {
          expect(err.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
          expect(err.message).toBe(ErrorMessages.ru.REFRESH_TOKEN_EXPIRED);
          expect(tokensService.removeRefreshToken).toBeCalledTimes(0);
          expect(tokensService.generateRefreshToken).toBeCalledTimes(0);
          expect(tokensService.generateAccessToken).toBeCalledTimes(0);
        }
      }, expiresIn * 1000);
      jest.runAllTimers();
    });
    it('UpdateAccessRefreshTokensFromRefreshToken method - should be unsuccessful result (token is malformed)', async () => {
      const expiresIn = 5000;
      const { refreshToken } = getRefreshTokenGeneratedData({
        jwtService,
        expiresIn,
      });
      jest.spyOn(tokensService, 'removeRefreshToken');
      jest.spyOn(tokensService, 'generateRefreshToken');
      jest.spyOn(tokensService, 'generateAccessToken');
      jest.useFakeTimers();
      expect.assertions(5);
      setTimeout(async () => {
        try {
          await tokensService.updateAccessRefreshTokensFromRefreshToken(refreshToken + 'sdf');
          sendPseudoError();
        } catch (err) {
          expect(err.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
          expect(err.message).toBe(ErrorMessages.ru.REFRESH_TOKEN_IS_MALFORMED);
          expect(tokensService.removeRefreshToken).toBeCalledTimes(0);
          expect(tokensService.generateRefreshToken).toBeCalledTimes(0);
          expect(tokensService.generateAccessToken).toBeCalledTimes(0);
        }
      }, expiresIn * 1000);
      jest.runOnlyPendingTimers();
    });
    it('UpdateAccessRefreshTokensFromRefreshToken method - should be unsuccessful result (token is malformed: without jti)', async () => {
      const expiresIn = 5000;
      const { refreshToken } = getRefreshTokenGeneratedData({
        jwtService,
        expiresIn,
        withoutJwtId: true,
      });
      jest.spyOn(tokensService, 'removeRefreshToken');
      jest.spyOn(tokensService, 'generateRefreshToken');
      jest.spyOn(tokensService, 'generateAccessToken');
      try {
        await tokensService.updateAccessRefreshTokensFromRefreshToken(refreshToken);
        sendPseudoError();
      } catch (err) {
        expect(err.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(err.message).toBe(ErrorMessages.ru.REFRESH_TOKEN_IS_MALFORMED);
        expect(tokensService.removeRefreshToken).toBeCalledTimes(0);
        expect(tokensService.generateRefreshToken).toBeCalledTimes(0);
        expect(tokensService.generateAccessToken).toBeCalledTimes(0);
      }
    });
    it('UpdateAccessRefreshTokensFromRefreshToken method - should be unsuccessful result (token not found)', async () => {
      const { refreshToken, tokenUUID } = getRefreshTokenGeneratedData({
        jwtService,
        expiresIn: TokensService.getRefreshTokenExpiresIn(),
      });

      jest.spyOn(refreshTokensService, 'findTokenByUUId').mockImplementation(async () => {
        return Promise.resolve(undefined);
      });
      jest.spyOn(refreshTokensService, 'removeTokenByUUId').mockImplementation(async () => {
        return Promise.resolve(0);
      });
      jest.spyOn(tokensService, 'removeRefreshToken');
      jest.spyOn(tokensService, 'generateRefreshToken');
      jest.spyOn(tokensService, 'generateAccessToken');

      try {
        await tokensService.updateAccessRefreshTokensFromRefreshToken(refreshToken);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(error.message).toBe(ErrorMessages.ru.REFRESH_TOKEN_NOT_FOUND);
        expect(refreshTokensService.findTokenByUUId).toBeCalledTimes(1);
        expect(refreshTokensService.findTokenByUUId).toBeCalledWith(tokenUUID);
        expect(refreshTokensService.removeTokenByUUId).toBeCalledTimes(1);
        expect(refreshTokensService.removeTokenByUUId).toBeCalledWith(tokenUUID);
        expect(tokensService.removeRefreshToken).toBeCalledTimes(1);
        expect(tokensService.removeRefreshToken).toBeCalledWith(refreshToken);
        expect(userService.getUserById).toBeCalledTimes(0);
        expect(tokensService.generateRefreshToken).toBeCalledTimes(0);
        expect(refreshTokensService.createRefreshToken).toBeCalledTimes(0);
        expect(tokensService.generateAccessToken).toBeCalledTimes(0);
      }
    });
    it('UpdateAccessRefreshTokensFromRefreshToken method - should be unsuccessful result (token revoked)', async () => {
      const { refreshToken, tokenUUID } = getRefreshTokenGeneratedData({
        jwtService,
        expiresIn: TokensService.getRefreshTokenExpiresIn(),
      });

      const mockRefreshToken = getMockRefreshToken();
      mockRefreshToken.isRevoked = true;
      jest.spyOn(refreshTokensService, 'findTokenByUUId').mockImplementation(async () => {
        return Promise.resolve(mockRefreshToken as RefreshToken);
      });
      jest.spyOn(refreshTokensService, 'removeTokenByUUId').mockImplementation(async () => {
        return Promise.resolve(1);
      });
      jest.spyOn(tokensService, 'removeRefreshToken');
      jest.spyOn(tokensService, 'generateRefreshToken');
      jest.spyOn(tokensService, 'generateAccessToken');

      try {
        await tokensService.updateAccessRefreshTokensFromRefreshToken(refreshToken);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(error.message).toBe(ErrorMessages.ru.REFRESH_TOKEN_REVOKED);
        expect(refreshTokensService.findTokenByUUId).toBeCalledTimes(1);
        expect(refreshTokensService.findTokenByUUId).toBeCalledWith(tokenUUID);
        expect(refreshTokensService.removeTokenByUUId).toBeCalledTimes(1);
        expect(refreshTokensService.removeTokenByUUId).toBeCalledWith(tokenUUID);
        expect(tokensService.removeRefreshToken).toBeCalledTimes(1);
        expect(tokensService.removeRefreshToken).toBeCalledWith(refreshToken);
        expect(userService.getUserById).toBeCalledTimes(0);
        expect(tokensService.generateRefreshToken).toBeCalledTimes(0);
        expect(refreshTokensService.createRefreshToken).toBeCalledTimes(0);
        expect(tokensService.generateAccessToken).toBeCalledTimes(0);
      }
    });
    it('UpdateAccessRefreshTokensFromRefreshToken method - should be unsuccessful result (token is malformed: without sub)', async () => {
      const { refreshToken, tokenUUID } = getRefreshTokenGeneratedData({
        jwtService,
        expiresIn: TokensService.getRefreshTokenExpiresIn(),
        withoutSubject: true,
      });

      const mockRefreshToken = getMockRefreshToken();
      jest.spyOn(refreshTokensService, 'findTokenByUUId').mockImplementation(() => {
        return Promise.resolve(mockRefreshToken as RefreshToken);
      });
      jest.spyOn(refreshTokensService, 'removeTokenByUUId').mockImplementation(async () => {
        return Promise.resolve(1);
      });
      jest.spyOn(tokensService, 'removeRefreshToken');
      jest.spyOn(tokensService, 'generateRefreshToken');
      jest.spyOn(tokensService, 'generateAccessToken');

      try {
        await tokensService.updateAccessRefreshTokensFromRefreshToken(refreshToken);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(error.message).toBe(ErrorMessages.ru.REFRESH_TOKEN_IS_MALFORMED);
        expect(refreshTokensService.findTokenByUUId).toBeCalledTimes(1);
        expect(refreshTokensService.findTokenByUUId).toBeCalledWith(tokenUUID);
        expect(refreshTokensService.removeTokenByUUId).toBeCalledTimes(1);
        expect(refreshTokensService.removeTokenByUUId).toBeCalledWith(tokenUUID);
        expect(tokensService.removeRefreshToken).toBeCalledTimes(1);
        expect(tokensService.removeRefreshToken).toBeCalledWith(refreshToken);
        expect(userService.getUserById).toBeCalledTimes(0);
        expect(tokensService.generateRefreshToken).toBeCalledTimes(0);
        expect(refreshTokensService.createRefreshToken).toBeCalledTimes(0);
        expect(tokensService.generateAccessToken).toBeCalledTimes(0);
      }
    });
    it('UpdateAccessRefreshTokensFromRefreshToken method - should be unsuccessful result (token is malformed: user by subject not found)', async () => {
      const { refreshToken, mockUser, tokenUUID } = getRefreshTokenGeneratedData({
        jwtService,
        expiresIn: TokensService.getRefreshTokenExpiresIn(),
      });

      const mockRefreshToken = getMockRefreshToken();
      jest.spyOn(refreshTokensService, 'findTokenByUUId').mockImplementation(async () => {
        return Promise.resolve(mockRefreshToken as RefreshToken);
      });
      jest.spyOn(refreshTokensService, 'removeTokenByUUId').mockImplementation(async () => {
        return Promise.resolve(1);
      });
      jest.spyOn(userService, 'getUserById').mockImplementation(async () => {
        return Promise.resolve(undefined);
      });
      jest.spyOn(tokensService, 'removeRefreshToken');
      jest.spyOn(tokensService, 'generateRefreshToken');
      jest.spyOn(tokensService, 'generateAccessToken');

      try {
        await tokensService.updateAccessRefreshTokensFromRefreshToken(refreshToken);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(error.message).toBe(ErrorMessages.ru.REFRESH_TOKEN_IS_MALFORMED);
        expect(refreshTokensService.findTokenByUUId).toBeCalledTimes(1);
        expect(refreshTokensService.findTokenByUUId).toBeCalledWith(tokenUUID);
        expect(refreshTokensService.removeTokenByUUId).toBeCalledTimes(1);
        expect(refreshTokensService.removeTokenByUUId).toBeCalledWith(tokenUUID);
        expect(tokensService.removeRefreshToken).toBeCalledTimes(1);
        expect(tokensService.removeRefreshToken).toBeCalledWith(refreshToken);
        expect(userService.getUserById).toBeCalledTimes(1);
        expect(userService.getUserById).toBeCalledWith(`${mockUser.id}`);
        expect(tokensService.generateRefreshToken).toBeCalledTimes(0);
        expect(refreshTokensService.createRefreshToken).toBeCalledTimes(0);
        expect(tokensService.generateAccessToken).toBeCalledTimes(0);
      }
    });
  });

  describe('TokensService - removeRefreshToken', () => {
    it('should return successful result', async () => {
      const { refreshToken, tokenUUID } = getRefreshTokenGeneratedData({
        jwtService,
        expiresIn: TokensService.getRefreshTokenExpiresIn(),
      });
      jest.spyOn(refreshTokensService, 'removeTokenByUUId').mockImplementation(async () => {
        return Promise.resolve(1);
      });

      const result = await tokensService.removeRefreshToken(refreshToken);
      expect(result).toBe(true);
      expect(refreshTokensService.removeTokenByUUId).toBeCalledTimes(1);
      expect(refreshTokensService.removeTokenByUUId).toBeCalledWith(tokenUUID);
    });
    it('should return unsuccessful result', async () => {
      const { refreshToken, tokenUUID } = getRefreshTokenGeneratedData({
        jwtService,
        expiresIn: TokensService.getRefreshTokenExpiresIn(),
      });
      jest.spyOn(refreshTokensService, 'removeTokenByUUId').mockImplementation(async () => {
        return Promise.resolve(0);
      });

      const result = await tokensService.removeRefreshToken(refreshToken);

      expect(result).toBe(false);
      expect(refreshTokensService.removeTokenByUUId).toBeCalledTimes(1);
      expect(refreshTokensService.removeTokenByUUId).toBeCalledWith(tokenUUID);
    });
    it('should throw exception (token expired)', async () => {
      const expiresIn = 1000;
      const { refreshToken } = getRefreshTokenGeneratedData({
        jwtService,
        expiresIn,
      });

      jest.useFakeTimers();
      expect.assertions(3);
      setTimeout(async () => {
        try {
          await tokensService.removeRefreshToken(refreshToken);
          sendPseudoError();
        } catch (err) {
          expect(err.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
          expect(err.message).toBe(ErrorMessages.ru.REFRESH_TOKEN_EXPIRED);
          expect(refreshTokensService.removeTokenByUUId).toBeCalledTimes(0);
        }
      }, expiresIn * 1000);
      jest.runOnlyPendingTimers();
    });
    it('should throw exception (token is malformed)', async () => {
      const expiresIn = 1000;
      const { refreshToken } = getRefreshTokenGeneratedData({
        jwtService,
        expiresIn,
      });

      try {
        await tokensService.removeRefreshToken(refreshToken + 'sdf');
        sendPseudoError();
      } catch (err) {
        expect(err.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(err.message).toBe(ErrorMessages.ru.REFRESH_TOKEN_IS_MALFORMED);
        expect(refreshTokensService.removeTokenByUUId).toBeCalledTimes(0);
      }
    });
    it('should throw exception (token is malformed: without jti)', async () => {
      const expiresIn = 1000;
      const { refreshToken } = getRefreshTokenGeneratedData({
        jwtService,
        expiresIn,
        withoutJwtId: true,
      });

      try {
        await tokensService.removeRefreshToken(refreshToken + 'sdf');
        sendPseudoError();
      } catch (err) {
        expect(err.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(err.message).toBe(ErrorMessages.ru.REFRESH_TOKEN_IS_MALFORMED);
        expect(refreshTokensService.removeTokenByUUId).toBeCalledTimes(0);
      }
    });
  });

  describe('TokensService - getRefreshTokenExpiresIn', () => {
    it('should return a number of milliseconds equal to 30 days', () => {
      const expiresIn = TokensService.getRefreshTokenExpiresIn();
      const thirtyDaysInMS = 60 * 60 * 24 * 30 * 1000;
      expect(expiresIn).toBe(thirtyDaysInMS);
    });
  });

  describe('TokensService - getRefreshTokenExpiration', () => {
    it('should return ', () => {
      const date = tokensService.getRefreshTokenExpiration();
      const dayInMS = 60 * 60 * 24 * 1000;
      const thirtyDaysInMS = dayInMS * 30;
      const thirtyOneDaysInMS = dayInMS * 31;
      const delta = date.getTime() - Date.now();
      expect(delta).toBeGreaterThanOrEqual(thirtyDaysInMS);
      expect(delta).toBeLessThanOrEqual(thirtyOneDaysInMS);
    });
  });
});
