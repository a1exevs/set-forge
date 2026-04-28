import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';

import { FollowersController } from '@followers/followers.controller';
import { FollowersService } from '@followers/followers.service';
import { JwtAuthGuard } from '@common/guards';
import { RefreshTokenGuard } from '@common/guards';
import { sendPseudoError } from '@test/unit/helpers';

describe('FollowersController', () => {
  let followersController: FollowersController;
  let followersService: FollowersService;
  let jwtAuthGuard: JwtAuthGuard;
  let refreshTokenGuard: RefreshTokenGuard;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    const jwtService = { provide: JwtService, useValue: {} };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [FollowersController],
      providers: [
        {
          provide: FollowersService,
          useValue: {
            follow: jest.fn(x => x),
            unfollow: jest.fn(x => x),
          },
        },
        jwtService,
      ],
    }).compile();
    followersController = moduleRef.get<FollowersController>(FollowersController);
    followersService = moduleRef.get<FollowersService>(FollowersService);
    jwtAuthGuard = moduleRef.get<JwtAuthGuard>(JwtAuthGuard);
    refreshTokenGuard = moduleRef.get<RefreshTokenGuard>(RefreshTokenGuard);
  });

  describe('FollowersController - definition', () => {
    it('FollowersController - should be defined', () => {
      expect(followersController).toBeDefined();
    });
    it('FollowersService - should be defined', () => {
      expect(followersService).toBeDefined();
    });
    it('JwtAuthGuard - should be defined', () => {
      expect(jwtAuthGuard).toBeDefined();
    });
    it('RefreshTokenGuard - should be defined', () => {
      expect(refreshTokenGuard).toBeDefined();
    });
  });

  describe('FollowersController - follow', () => {
    it('should be successful result', async () => {
      jest.spyOn(followersService, 'follow').mockImplementation(() => {
        return Promise.resolve(true);
      });
      const followerId = 1;
      const req = { user: { id: followerId } };
      const userId = 2;
      const result = await followersController.follow(userId, req);
      expect(result.result).toBeTruthy();
    });
    it('should throw exception (follower Id and user Id are equal)', async () => {
      jest.spyOn(followersService, 'follow').mockImplementation(() => {
        throw new BadRequestException();
      });
      const followerId = 1;
      const req = { user: { id: followerId } };
      const userId = 1;
      try {
        await followersController.follow(userId, req);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
    it('should throw exception (follower or user is not found)', async () => {
      jest.spyOn(followersService, 'follow').mockImplementation(() => {
        throw new NotFoundException();
      });
      const followerId = 11;
      const req = { user: { id: followerId } };
      const userId = 22;
      try {
        await followersController.follow(userId, req);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('FollowersController - unfollow', () => {
    it('should be successful result', async () => {
      jest.spyOn(followersService, 'unfollow').mockImplementation(() => {
        return Promise.resolve(true);
      });
      const followerId = 1;
      const req = { user: { id: followerId } };
      const userId = 2;
      const result = await followersController.unfollow(userId, req);
      expect(result.result).toBeTruthy();
    });
    it('should throw exception (follower Id and user Id are equal)', async () => {
      jest.spyOn(followersService, 'unfollow').mockImplementation(() => {
        throw new BadRequestException();
      });
      const followerId = 1;
      const req = { user: { id: followerId } };
      const userId = 1;
      try {
        await followersController.unfollow(userId, req);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
    it('should throw exception (follower or user is not found)', async () => {
      jest.spyOn(followersService, 'unfollow').mockImplementation(() => {
        throw new NotFoundException();
      });
      const followerId = 11;
      const req = { user: { id: followerId } };
      const userId = 22;
      try {
        await followersController.unfollow(userId, req);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
