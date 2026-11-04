import { HttpStatus } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'node:crypto';

import { ACCESS_TOKEN_CLAIMS } from '@auth/access-token-claims';
import { RefreshToken } from '@auth/refresh-tokens.model';
import { RefreshTokensService } from '@auth/refresh-tokens.service';
import { TokensService } from '@auth/tokens.service';
import { ErrorMessages } from '@common/constants';
import { User } from '@users/users.model';
import { UsersService } from '@users/users.service';

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

interface IAccessTokenVerifyResult extends IMockUser {
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  sub: string;
}

type StoredToken = Pick<RefreshToken, 'userId' | 'tokenHash' | 'expires'>;

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

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const LIFETIME_IN_DAYS = 30;

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

/** Runs `action` with the clock at `time` (ms since the epoch): the service reads `Date.now`. */
const atTime = async <T>(time: number, action: () => Promise<T>): Promise<T> => {
  const clock = jest.spyOn(Date, 'now').mockReturnValue(time);
  try {
    return await action();
  } finally {
    clock.mockRestore();
  }
};

describe('TokensService', () => {
  let tokensService: TokensService;
  let userService: UsersService;
  let jwtService: JwtService;
  let refreshTokensService: RefreshTokensService;
  let store: StoredToken[];
  const mockUser = getMockUser() as unknown as User;

  beforeEach(async () => {
    jest.clearAllMocks();
    store = [];
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        {
          provide: UsersService,
          useValue: {
            getUserById: jest.fn(async (id: number) => (id === mockUser.id ? mockUser : null)),
          },
        },
        {
          // An in-memory table: the specs prove the service against the records it really writes.
          provide: RefreshTokensService,
          useValue: {
            createRefreshToken: jest.fn(async (userId: number, tokenHash: string, ttl: number) => {
              const token = { userId, tokenHash, expires: new Date(Date.now() + ttl) };
              store.push(token);
              return token;
            }),
            findTokenByHash: jest.fn(async (tokenHash: string) => store.find(t => t.tokenHash === tokenHash) ?? null),
            removeTokenByHash: jest.fn(async (tokenHash: string) => {
              const before = store.length;
              store = store.filter(t => t.tokenHash !== tokenHash);
              return before - store.length;
            }),
          },
        },
      ],
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        JwtModule.registerAsync({
          useFactory: (config: ConfigService) => {
            const secret = config.get<string>('JWT_SECRET_KEY');
            if (typeof secret !== 'string' || !secret.trim()) {
              throw new Error('JWT_SECRET_KEY must be set for TokensService unit tests (see test-environment.ts).');
            }
            return {
              secret: secret.trim(),
              signOptions: {
                expiresIn: '600s',
                ...ACCESS_TOKEN_CLAIMS,
              },
              verifyOptions: { ...ACCESS_TOKEN_CLAIMS },
            };
          },
          inject: [ConfigService],
        }),
      ],
    }).compile();

    tokensService = module.get<TokensService>(TokensService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokensService = module.get<RefreshTokensService>(RefreshTokensService);
  });

  afterEach(() => {
    jest.useRealTimers();
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
      const token = await tokensService.generateAccessToken(mockUser);
      const payload: IAccessTokenVerifyResult = jwtService.verify(token);

      expect(payload.id).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.roles).not.toBeUndefined();
      expect(payload.sub).toBe(`${mockUser.id}`);
      expect(payload.aud).toBe(ACCESS_TOKEN_CLAIMS.audience);
      expect(payload.iss).toBe(ACCESS_TOKEN_CLAIMS.issuer);
    });
  });

  describe('TokensService - generateRefreshToken', () => {
    it('should issue an opaque value of 256 random bits and store only its hash', async () => {
      const ttl = TokensService.getRefreshTokenExpiresIn();

      const token = await tokensService.generateRefreshToken(mockUser, ttl);

      expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(jwtService.decode(token)).toBeNull();
      expect(refreshTokensService.createRefreshToken).toBeCalledTimes(1);
      expect(refreshTokensService.createRefreshToken).toBeCalledWith(mockUser.id, sha256(token), ttl);
      expect(store.some(t => t.tokenHash === token)).toBe(false);
    });
    it('should issue a different value every time', async () => {
      const ttl = TokensService.getRefreshTokenExpiresIn();

      const first = await tokensService.generateRefreshToken(mockUser, ttl);
      const second = await tokensService.generateRefreshToken(mockUser, ttl);

      expect(first).not.toBe(second);
    });
  });

  describe('TokensService - updateAccessRefreshTokensFromRefreshToken', () => {
    it('should replace the token with a new one and issue an access token for its user', async () => {
      const refreshToken = await tokensService.generateRefreshToken(mockUser, TokensService.getRefreshTokenExpiresIn());

      const result = await tokensService.updateAccessRefreshTokensFromRefreshToken(refreshToken);

      expect(result.user).toEqual(mockUser);
      expect(jwtService.verify<IAccessTokenVerifyResult>(result.accessToken).id).toBe(mockUser.id);
      expect(result.refreshToken).not.toBe(refreshToken);
      expect(store.map(t => t.tokenHash)).toEqual([sha256(result.refreshToken)]);
      expect(userService.getUserById).toBeCalledWith(mockUser.id);
    });
    it('should answer REFRESH_TOKEN_NOT_FOUND for the token a previous refresh replaced', async () => {
      const refreshToken = await tokensService.generateRefreshToken(mockUser, TokensService.getRefreshTokenExpiresIn());
      await tokensService.updateAccessRefreshTokensFromRefreshToken(refreshToken);

      await expect(tokensService.updateAccessRefreshTokensFromRefreshToken(refreshToken)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
        message: ErrorMessages.REFRESH_TOKEN_NOT_FOUND,
      });
      expect(store).toHaveLength(1);
    });
    it('should answer REFRESH_TOKEN_NOT_FOUND for a value that names no record', async () => {
      jest.spyOn(tokensService, 'generateRefreshToken');

      await expect(tokensService.updateAccessRefreshTokensFromRefreshToken('damaged')).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
        message: ErrorMessages.REFRESH_TOKEN_NOT_FOUND,
      });
      expect(refreshTokensService.findTokenByHash).toBeCalledWith(sha256('damaged'));
      expect(refreshTokensService.removeTokenByHash).toBeCalledTimes(0);
      expect(tokensService.generateRefreshToken).toBeCalledTimes(0);
    });
    it('should answer REFRESH_TOKEN_NOT_FOUND for a value that is not a string, without a lookup', async () => {
      await expect(tokensService.updateAccessRefreshTokensFromRefreshToken({ forged: true })).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
        message: ErrorMessages.REFRESH_TOKEN_NOT_FOUND,
      });
      expect(refreshTokensService.findTokenByHash).toBeCalledTimes(0);
    });
    it('should answer REFRESH_TOKEN_NOT_FOUND and spend the token when its user is gone', async () => {
      const refreshToken = await tokensService.generateRefreshToken(mockUser, TokensService.getRefreshTokenExpiresIn());
      jest.spyOn(userService, 'getUserById').mockResolvedValue(null);

      await expect(tokensService.updateAccessRefreshTokensFromRefreshToken(refreshToken)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
        message: ErrorMessages.REFRESH_TOKEN_NOT_FOUND,
      });
      expect(store).toHaveLength(0);
    });
    // @invariant session/refresh-token-lifetime
    it('should answer REFRESH_TOKEN_EXPIRED and spend the token used after its lifetime', async () => {
      const issuedAt = Date.now();
      const refreshToken = await tokensService.generateRefreshToken(mockUser, TokensService.getRefreshTokenExpiresIn());
      jest.spyOn(tokensService, 'generateRefreshToken');

      await expect(
        atTime(issuedAt + (LIFETIME_IN_DAYS + 1) * DAY_IN_MS, async () =>
          tokensService.updateAccessRefreshTokensFromRefreshToken(refreshToken),
        ),
      ).rejects.toMatchObject({ status: HttpStatus.UNAUTHORIZED, message: ErrorMessages.REFRESH_TOKEN_EXPIRED });
      expect(store).toHaveLength(0);
      expect(userService.getUserById).toBeCalledTimes(0);
      expect(tokensService.generateRefreshToken).toBeCalledTimes(0);
    });
    // @invariant session/refresh-token-lifetime
    it('should still refresh a token used just before the end of its lifetime', async () => {
      const issuedAt = Date.now();
      const refreshToken = await tokensService.generateRefreshToken(mockUser, TokensService.getRefreshTokenExpiresIn());

      const result = await atTime(issuedAt + LIFETIME_IN_DAYS * DAY_IN_MS - 1000, async () =>
        tokensService.updateAccessRefreshTokensFromRefreshToken(refreshToken),
      );

      expect(result.user).toEqual(mockUser);
    });
  });

  describe('TokensService - revokeRefreshToken', () => {
    // @invariant session/refresh-token-lifetime
    it('should remove the record of a token used after its lifetime', async () => {
      const issuedAt = Date.now();
      const refreshToken = await tokensService.generateRefreshToken(mockUser, TokensService.getRefreshTokenExpiresIn());

      await atTime(issuedAt + (LIFETIME_IN_DAYS + 1) * DAY_IN_MS, async () =>
        tokensService.revokeRefreshToken(refreshToken),
      );

      expect(store).toHaveLength(0);
    });
    it('should remove the record of the token', async () => {
      const refreshToken = await tokensService.generateRefreshToken(mockUser, TokensService.getRefreshTokenExpiresIn());

      await expect(tokensService.revokeRefreshToken(refreshToken)).resolves.toBeUndefined();

      expect(refreshTokensService.removeTokenByHash).toBeCalledWith(sha256(refreshToken));
      expect(store).toHaveLength(0);
    });
    it('should resolve when the record is already gone or never existed', async () => {
      const refreshToken = await tokensService.generateRefreshToken(mockUser, TokensService.getRefreshTokenExpiresIn());
      await tokensService.revokeRefreshToken(refreshToken);

      await expect(tokensService.revokeRefreshToken(refreshToken)).resolves.toBeUndefined();
      await expect(tokensService.revokeRefreshToken('damaged')).resolves.toBeUndefined();
    });
    it('should remove nothing for a value that is not a string', async () => {
      await expect(tokensService.revokeRefreshToken({ forged: true })).resolves.toBeUndefined();

      expect(refreshTokensService.removeTokenByHash).toBeCalledTimes(0);
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
