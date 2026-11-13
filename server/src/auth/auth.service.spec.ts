import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';

import { AuthService } from '@auth/auth.service';
import { LoginRequest, RegisterRequest } from '@auth/dto';
import { SignInAttempt, SignInAttemptsService } from '@auth/sign-in-attempts.service';
import { TokensService } from '@auth/tokens.service';
import { ResultCodes } from '@common/constants';
import { ErrorItemResponse } from '@common/dto';
import { AppException } from '@common/exceptions';
import { SecurityService } from '@security/security.service';
import { sendPseudoError } from '@test/unit/helpers';
import { User } from '@users/users.model';
import { UsersService } from '@users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;
  let tokenService: TokensService;
  let signInAttempts: { reserve: jest.Mock; succeeded: jest.Mock };
  let securityService: { solvesCaptcha: jest.Mock };

  const ADDRESS = '203.0.113.7';
  const attempt = (demandsCaptcha = false, nextDemandsCaptcha = false): SignInAttempt => ({
    accountAndAddressKey: 'sign-in:account-address:k',
    accountKey: 'sign-in:account:k',
    entry: 'e',
    demandsCaptcha,
    nextDemandsCaptcha,
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    signInAttempts = { reserve: jest.fn().mockResolvedValue(attempt()), succeeded: jest.fn() };
    securityService = { solvesCaptcha: jest.fn().mockResolvedValue(false) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            getUserByEmail: jest.fn(x => x),
            getUserById: jest.fn(x => x),
            createUser: jest.fn(x => x),
            deleteUser: jest.fn(x => x),
            updateDocumentAcceptance: jest.fn(x => x),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: TokensService,
          useValue: {
            generateAccessToken: jest.fn(x => x),
            generateRefreshToken: jest.fn(x => x),
            getRefreshTokenExpiration: jest.fn(x => x),
            updateAccessRefreshTokensFromRefreshToken: jest.fn(x => x),
            revokeRefreshToken: jest.fn(async () => undefined),
          },
        },
        { provide: SignInAttemptsService, useValue: signInAttempts },
        { provide: SecurityService, useValue: securityService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    tokenService = module.get<TokensService>(TokensService);
  });

  describe('AuthService - definition', () => {
    it('AuthService - should be defined', () => {
      expect(authService).toBeDefined();
    });
    it('UsersService - should be defined', () => {
      expect(userService).toBeDefined();
    });
    it('JwtService - should be defined', () => {
      expect(jwtService).toBeDefined();
    });
    it('TokensService - should be defined', () => {
      expect(tokenService).toBeDefined();
    });
  });

  describe('AuthService - registration', () => {
    it('Registration method: should be successful result', async () => {
      const email = 'user@yandex.com';
      const password = '1234';
      const hashedPassword = await bcrypt.hash(password, 5);
      const accessToken = 'asdfsdfsdf';
      const refreshToken = 'asdfsdfsdf';

      const registerDto: RegisterRequest.Dto = { email, password };
      const mockCreatedUser = {
        email,
        password: hashedPassword,
      };

      jest.spyOn(userService, 'createUser').mockImplementation(async () => {
        return Promise.resolve(mockCreatedUser as User);
      });
      jest.spyOn(userService, 'getUserByEmail').mockImplementation(async () => {
        return Promise.resolve(undefined);
      });
      jest.spyOn(tokenService, 'generateAccessToken').mockImplementation(async () => {
        return Promise.resolve(accessToken);
      });
      jest.spyOn(tokenService, 'generateRefreshToken').mockImplementation(async () => {
        return Promise.resolve(refreshToken);
      });
      jest.spyOn(tokenService, 'getRefreshTokenExpiration').mockImplementation(() => {
        const expiration = new Date();
        expiration.setTime(expiration.getTime() + TokensService.getRefreshTokenExpiresIn());
        return expiration;
      });
      const spyHashF = jest.spyOn(bcrypt, 'hash').mockImplementation(() => {
        return hashedPassword;
      });

      const result = await authService.registration(registerDto);

      expect(result.status).toBe('success');
      expect(result.data.payload.accessToken).toBe(accessToken);
      expect(result.data.payload.refreshToken).toBe(refreshToken);
      expect(result.data.payload.type).toBe('bearer');
      expect(userService.getUserByEmail).toBeCalledTimes(1);
      expect(userService.getUserByEmail).toBeCalledWith(email);
      expect(userService.createUser).toBeCalledTimes(1);
      expect(userService.createUser).toBeCalledWith({ ...registerDto, password: hashedPassword });
      expect(spyHashF).toBeCalledTimes(1);
      expect(spyHashF).toBeCalledWith(password, 5);
      expect(tokenService.generateAccessToken).toBeCalledTimes(1);
      expect(tokenService.generateAccessToken).toBeCalledWith(mockCreatedUser);
      expect(tokenService.generateRefreshToken).toBeCalledTimes(1);
      expect(tokenService.generateRefreshToken).toBeCalledWith(
        mockCreatedUser,
        TokensService.getRefreshTokenExpiresIn(),
      );
      spyHashF.mockRestore();
    });
    // @invariant session/email-unique
    it('Registration method: should throw Bad Request exception (user already exists)', async () => {
      const email = 'user@yandex.com';
      const password = '1234';
      const hashedPassword = await bcrypt.hash(password, 5);

      const registerDto: RegisterRequest.Dto = { email, password };
      const mockCreatedUser = {
        email,
        password: hashedPassword,
      };

      jest.spyOn(userService, 'getUserByEmail').mockImplementation(async () => {
        return Promise.resolve(mockCreatedUser as User);
      });
      const spyHashF = jest.spyOn(bcrypt, 'hash').mockImplementation(() => {
        return hashedPassword;
      });

      try {
        await authService.registration(registerDto);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.CONFLICT);
        expect(userService.getUserByEmail).toBeCalledTimes(1);
        expect(userService.getUserByEmail).toBeCalledWith(email);
        expect(userService.createUser).toBeCalledTimes(0);
        expect(spyHashF).toBeCalledTimes(0);
        expect(tokenService.generateAccessToken).toBeCalledTimes(0);
        expect(tokenService.generateRefreshToken).toBeCalledTimes(0);
        spyHashF.mockRestore();
      }
    });
    it('Registration method: should fail when the new user is gone before its refresh token is stored', async () => {
      const mockCreatedUser = { id: 1, email: 'user@yandex.com' };
      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'createUser').mockResolvedValue(mockCreatedUser as User);
      jest.spyOn(tokenService, 'generateRefreshToken').mockResolvedValue(null);

      await expect(authService.registration({ email: mockCreatedUser.email, password: '1234' })).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
        errors: [new ErrorItemResponse.Dto('FAILED_TO_CREATE_USER')],
      });
    });
  });

  describe('AuthService - login', () => {
    it('Login method: should be successful result', async () => {
      const email = 'user@yandex.com';
      const password = '1234';
      const hashedPassword = await bcrypt.hash(password, 5);
      const accessToken = 'asdfsdfsdf';
      const refreshToken = 'asdfsdfsdf';

      const loginDto: LoginRequest.Dto = { email, password };
      const mockUser = {
        email,
        password: hashedPassword,
      };

      jest.spyOn(userService, 'getUserByEmail').mockImplementation(async () => {
        return Promise.resolve(mockUser as User);
      });
      jest.spyOn(tokenService, 'generateAccessToken').mockImplementation(async () => {
        return Promise.resolve(accessToken);
      });
      jest.spyOn(tokenService, 'generateRefreshToken').mockImplementation(async () => {
        return Promise.resolve(refreshToken);
      });
      jest.spyOn(tokenService, 'getRefreshTokenExpiration').mockImplementation(() => {
        const expiration = new Date();
        expiration.setTime(expiration.getTime() + TokensService.getRefreshTokenExpiresIn());
        return expiration;
      });

      const result = await authService.login(loginDto, ADDRESS);

      expect(result.status).toBe('success');
      expect(result.data.payload.accessToken).toBe(accessToken);
      expect(result.data.payload.refreshToken).toBe(refreshToken);
      expect(result.data.payload.type).toBe('bearer');
      expect(userService.getUserByEmail).toBeCalledTimes(1);
      expect(userService.getUserByEmail).toBeCalledWith(email, true);
      expect(tokenService.generateAccessToken).toBeCalledTimes(1);
      expect(tokenService.generateAccessToken).toBeCalledWith(mockUser);
      expect(tokenService.generateRefreshToken).toBeCalledTimes(1);
      expect(tokenService.generateRefreshToken).toBeCalledWith(mockUser, TokensService.getRefreshTokenExpiresIn());
      expect(signInAttempts.reserve).toBeCalledWith(email, ADDRESS);
      expect(signInAttempts.succeeded).toBeCalledTimes(1);
    });
    // @invariant session/deletion-during-sign-in
    it('Login method: should be unauthorized when the account is deleted before the refresh token is stored', async () => {
      const password = '1234';
      const mockUser = { id: 1, email: 'user@yandex.com', password: await bcrypt.hash(password, 5) };
      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(mockUser as User);
      jest.spyOn(tokenService, 'generateRefreshToken').mockResolvedValue(null);

      await expect(authService.login({ email: mockUser.email, password }, ADDRESS)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
        errors: [new ErrorItemResponse.Dto('INVALID_EMAIL_OR_PASSWORD')],
      });
    });
    it('Login method: should be unauthorized (user with email not found)', async () => {
      const email = 'user@yandex.com';
      const password = '1234';

      const loginDto: LoginRequest.Dto = { email, password };

      jest.spyOn(userService, 'getUserByEmail').mockImplementation(async () => {
        return Promise.resolve(undefined);
      });

      try {
        await authService.login(loginDto, ADDRESS);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.errors).toEqual([new ErrorItemResponse.Dto('INVALID_EMAIL_OR_PASSWORD')]);
        expect(userService.getUserByEmail).toBeCalledTimes(1);
        expect(userService.getUserByEmail).toBeCalledWith(email, true);
        expect(tokenService.generateAccessToken).toBeCalledTimes(0);
        expect(tokenService.generateRefreshToken).toBeCalledTimes(0);
      }
    });
    it('Login method: should be unauthorized (password is incorrect)', async () => {
      const email = 'user@yandex.com';
      const password = '1234';
      const hashedPassword = await bcrypt.hash(password, 5);
      const incorrectPassword = password + 'sadf';

      const loginDto: LoginRequest.Dto = { email, password: incorrectPassword };
      const mockUser = {
        email,
        password: hashedPassword,
      };

      jest.spyOn(userService, 'getUserByEmail').mockImplementation(async () => {
        return Promise.resolve(mockUser as User);
      });

      try {
        await authService.login(loginDto, ADDRESS);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.errors).toEqual([new ErrorItemResponse.Dto('INVALID_EMAIL_OR_PASSWORD')]);
        expect(userService.getUserByEmail).toBeCalledTimes(1);
        expect(userService.getUserByEmail).toBeCalledWith(email, true);
        expect(tokenService.generateAccessToken).toBeCalledTimes(0);
        expect(tokenService.generateRefreshToken).toBeCalledTimes(0);
      }
    });
  });

  // @invariant session/captcha-counts-login-only
  describe('AuthService - login with the captcha', () => {
    const password = '1234';
    let mockUser: { id: number; email: string; password: string };

    beforeEach(async () => {
      mockUser = { id: 1, email: 'user@yandex.com', password: await bcrypt.hash(password, 5) };
      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(mockUser as User);
      jest.spyOn(tokenService, 'generateRefreshToken').mockResolvedValue('refresh');
    });

    it('should demand the captcha without checking the password when the captcha is not solved', async () => {
      signInAttempts.reserve.mockResolvedValue(attempt(true, true));
      const compare = jest.spyOn(bcrypt, 'compare');

      await expect(
        authService.login({ email: mockUser.email, password, captcha: 'wrong', captchaId: 'id-1' }, ADDRESS),
      ).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
        errors: [new ErrorItemResponse.Dto('NEED_AUTHORIZATION_WITH_CAPTCHA')],
        resultCode: ResultCodes.NEED_CAPTCHA_AUTHORIZATION,
      });
      expect(securityService.solvesCaptcha).toBeCalledWith('id-1', 'wrong');
      expect(compare).not.toBeCalled();
      expect(signInAttempts.succeeded).not.toBeCalled();
    });

    it('should sign in with a solved captcha and the right password, and start the count over', async () => {
      signInAttempts.reserve.mockResolvedValue(attempt(true, true));
      securityService.solvesCaptcha.mockResolvedValue(true);

      const result = await authService.login(
        { email: mockUser.email, password, captcha: 'aB3d', captchaId: 'id-1' },
        ADDRESS,
      );

      expect(result.status).toBe('success');
      expect(signInAttempts.succeeded).toBeCalledTimes(1);
    });

    it('should not look at the captcha while the count is under its threshold', async () => {
      await authService.login({ email: mockUser.email, password }, ADDRESS);

      expect(securityService.solvesCaptcha).not.toBeCalled();
    });

    it('should announce the captcha with the failure that reaches the threshold', async () => {
      signInAttempts.reserve.mockResolvedValue(attempt(false, true));

      await expect(authService.login({ email: mockUser.email, password: 'wrong' }, ADDRESS)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
        errors: [
          new ErrorItemResponse.Dto('INVALID_EMAIL_OR_PASSWORD'),
          new ErrorItemResponse.Dto('NEED_AUTHORIZATION_WITH_CAPTCHA'),
        ],
        resultCode: ResultCodes.NEED_CAPTCHA_AUTHORIZATION,
      });
      expect(signInAttempts.succeeded).not.toBeCalled();
    });

    it('should answer an unknown email like a wrong password and spend the same password check on it', async () => {
      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);
      const compare = jest.spyOn(bcrypt, 'compare');

      await expect(authService.login({ email: 'nobody@yandex.com', password }, ADDRESS)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
        errors: [new ErrorItemResponse.Dto('INVALID_EMAIL_OR_PASSWORD')],
        resultCode: ResultCodes.ERROR,
      });
      expect(compare).toBeCalledTimes(1);
      expect(signInAttempts.reserve).toBeCalledWith('nobody@yandex.com', ADDRESS);
    });

    it('should start the count over once the password is right, before the sign-in is stored', async () => {
      jest.spyOn(tokenService, 'generateRefreshToken').mockResolvedValue(null);

      await expect(authService.login({ email: mockUser.email, password }, ADDRESS)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
        errors: [new ErrorItemResponse.Dto('INVALID_EMAIL_OR_PASSWORD')],
        resultCode: ResultCodes.ERROR,
      });
      expect(signInAttempts.succeeded).toBeCalledTimes(1);
    });
  });

  describe('AuthService - refresh', () => {
    it('Refresh method: should be successful result', async () => {
      const currentRefreshToken = 'adfsdfsadfsdf';
      const newRefreshToken = '12134214234123';
      const newAccessToken = 'sdfsdfsdfsdfsdfsdfsdf';
      const userId = 1;
      const mockUser = {
        id: userId,
        email: 'user@yandex.ru',
        password: 'asdfsafas',
      };
      jest.spyOn(tokenService, 'updateAccessRefreshTokensFromRefreshToken').mockImplementation(async () => {
        return Promise.resolve({
          refreshToken: newRefreshToken,
          accessToken: newAccessToken,
          user: mockUser as User,
        });
      });

      const result = await authService.refresh(currentRefreshToken);

      expect(result.status).toBe('success');
      expect(result.data.user.id).toBe(userId);
      expect(result.data.payload.type).toBe('bearer');
      expect(result.data.payload.refreshToken).toBe(newRefreshToken);
      expect(result.data.payload.accessToken).toBe(newAccessToken);
      expect(tokenService.updateAccessRefreshTokensFromRefreshToken).toBeCalledTimes(1);
      expect(tokenService.updateAccessRefreshTokensFromRefreshToken).toBeCalledWith(currentRefreshToken);
    });
    it('Refresh method: should throw exception (token not found)', async () => {
      const currentRefreshToken = 'adfsdfsadfsdf';
      jest.spyOn(tokenService, 'updateAccessRefreshTokensFromRefreshToken').mockImplementation(async () => {
        throw AppException.of(HttpStatus.UNAUTHORIZED, 'REFRESH_TOKEN_NOT_FOUND');
      });

      try {
        await authService.refresh(currentRefreshToken);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(error.errors).toEqual([new ErrorItemResponse.Dto('REFRESH_TOKEN_NOT_FOUND')]);
        expect(tokenService.updateAccessRefreshTokensFromRefreshToken).toBeCalledTimes(1);
        expect(tokenService.updateAccessRefreshTokensFromRefreshToken).toBeCalledWith(currentRefreshToken);
      }
    });
  });

  describe('AuthService - me', () => {
    // @invariant session/pending-derived
    it('Me method: should be successful result (documents up to date)', async () => {
      const userId = 1;
      const userEmail = 'user@yandex.ru';
      const mockUser = {
        id: userId,
        email: userEmail,
        password: 'asdfsafas',
        acceptedTermsVersion: 1,
        acceptedPrivacyVersion: 1,
      };
      jest.spyOn(userService, 'getUserById').mockImplementation(async () => {
        return Promise.resolve(mockUser as User);
      });
      const result = await authService.me(userId);
      expect(result.id).toBe(userId);
      expect(result.email).toBe(userEmail);
      expect(result.documentsPendingAcceptance).toBe(false);
      expect(userService.getUserById).toBeCalledTimes(1);
      expect(userService.getUserById).toBeCalledWith(userId);
    });
    // @invariant session/pending-derived
    it('Me method: documentsPendingAcceptance is true for a legacy user (null versions)', async () => {
      const userId = 1;
      const mockUser = { id: userId, email: 'user@yandex.ru', password: 'x', acceptedTermsVersion: null };
      jest.spyOn(userService, 'getUserById').mockImplementation(async () => Promise.resolve(mockUser as User));
      const result = await authService.me(userId);
      expect(result.documentsPendingAcceptance).toBe(true);
    });
    it('Me method: should be unauthorized (user not found', async () => {
      const userId = 1;
      jest.spyOn(userService, 'getUserById').mockImplementation(async () => {
        return Promise.resolve(undefined);
      });
      try {
        await authService.me(userId);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.errors).toEqual([new ErrorItemResponse.Dto('UNAUTHORIZED')]);
        expect(userService.getUserById).toBeCalledTimes(1);
        expect(userService.getUserById).toBeCalledWith(userId);
      }
    });
  });

  describe('AuthService - logout', () => {
    it('Logout method: should revoke the refresh token', async () => {
      const refreshToken = 'sdfsdfsdfsdf';

      await expect(authService.logout(refreshToken)).resolves.toBeUndefined();
      expect(tokenService.revokeRefreshToken).toBeCalledTimes(1);
      expect(tokenService.revokeRefreshToken).toBeCalledWith(refreshToken);
    });
  });

  describe('AuthService - deleteAccount', () => {
    it('deleteAccount method: should delete the user and return true', async () => {
      const userId = 1;
      const mockUser = { id: userId, email: 'user@yandex.ru', password: 'asdfsafas' };
      jest.spyOn(userService, 'getUserById').mockImplementation(async () => Promise.resolve(mockUser as User));
      jest.spyOn(userService, 'deleteUser').mockImplementation(async () => Promise.resolve(true));

      const result = await authService.deleteAccount(userId);

      expect(result).toBe(true);
      expect(userService.getUserById).toBeCalledTimes(1);
      expect(userService.getUserById).toBeCalledWith(userId);
      expect(userService.deleteUser).toBeCalledTimes(1);
      expect(userService.deleteUser).toBeCalledWith(userId);
    });
    it('deleteAccount method: should be unauthorized (user not found)', async () => {
      const userId = 1;
      jest.spyOn(userService, 'getUserById').mockImplementation(async () => Promise.resolve(undefined));

      try {
        await authService.deleteAccount(userId);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.errors).toEqual([new ErrorItemResponse.Dto('UNAUTHORIZED')]);
        expect(userService.getUserById).toBeCalledTimes(1);
        expect(userService.deleteUser).toBeCalledTimes(0);
      }
    });
  });

  describe('AuthService - acceptDocuments', () => {
    it('acceptDocuments method: records acceptance and returns an up-to-date user', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        email: 'user@yandex.ru',
        password: 'x',
        acceptedTermsVersion: 1,
        acceptedPrivacyVersion: 1,
      };
      jest.spyOn(userService, 'getUserById').mockImplementation(async () => Promise.resolve(mockUser as User));
      const updateSpy = jest
        .spyOn(userService, 'updateDocumentAcceptance')
        .mockImplementation(async () => Promise.resolve());

      const result = await authService.acceptDocuments(userId);

      expect(updateSpy).toBeCalledTimes(1);
      expect(updateSpy).toBeCalledWith(userId);
      expect(result.documentsPendingAcceptance).toBe(false);
    });
    it('acceptDocuments method: should be unauthorized (user not found)', async () => {
      const userId = 1;
      jest.spyOn(userService, 'getUserById').mockImplementation(async () => Promise.resolve(undefined));

      try {
        await authService.acceptDocuments(userId);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(401);
        expect(userService.updateDocumentAcceptance).toBeCalledTimes(0);
      }
    });
  });
});
