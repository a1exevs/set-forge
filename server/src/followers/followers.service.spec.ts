import '@root/string.extensions';

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { HttpStatus } from '@nestjs/common';
import { Op } from 'sequelize';

import { FollowersService } from '@followers/followers.service';
import { Follower } from '@followers/followers.model';
import { UsersService } from '@users/users.service';
import { sendPseudoError } from '@test/unit/helpers';
import { ErrorMessages } from '@common/constants';
import { User } from '@users/users.model';
import { FindOptions } from 'sequelize';

jest.mock('./followers.model');

describe('FollowersService', () => {
  let followersService: FollowersService;
  let model: typeof Follower;
  let usersService: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowersService,
        {
          provide: getModelToken(Follower),
          useValue: {
            findOne: jest.fn(x => x),
            create: jest.fn(x => x),
            destroy: jest.fn(x => x),
            findAll: jest.fn(x => x),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getUserById: jest.fn(x => x),
          },
        },
      ],
    }).compile();
    followersService = module.get<FollowersService>(FollowersService);
    model = module.get<typeof Follower>(getModelToken(Follower));
    usersService = module.get<UsersService>(UsersService);
  });

  describe('FollowersService - definition', () => {
    it('FollowersService - should be defined', () => {
      expect(followersService).toBeDefined();
    });
    it('Followers - should be defined', () => {
      expect(model).toBeDefined();
    });
    it('UsersService - should be defined', () => {
      expect(usersService).toBeDefined();
    });
  });

  describe('FollowersService - follow', () => {
    it('should be successful result', async () => {
      const followerId = 1;
      const userId = 2;
      const follower = { id: followerId };
      const user = { id: userId };
      const uuid = 'sdfsdfs';
      const followData = { followerId, userId };
      const getUserByIdFn = jest.spyOn(usersService, 'getUserById').mockImplementation((id: number) => {
        if (id === followerId) return Promise.resolve(follower as User);
        else if (id === userId) return Promise.resolve(user as User);
      });
      const findOneFn = jest.spyOn(model, 'findOne').mockImplementation(async () => {
        return Promise.resolve(null);
      });
      const createFn = jest.spyOn(model, 'create').mockImplementation(() => {
        return {
          followerId,
          userId,
          uuid,
        };
      });
      const result = await followersService.follow(followData);
      expect(result).toBeTruthy();
      expect(getUserByIdFn).toBeCalledTimes(2);
      expect(getUserByIdFn).toBeCalledWith(followerId);
      expect(getUserByIdFn).toBeCalledWith(userId);
      expect(findOneFn).toBeCalledTimes(1);
      expect(findOneFn).toBeCalledWith({ where: followData });
      expect(createFn).toBeCalledTimes(1);
      expect(createFn).toBeCalledWith(followData);
    });
    it('should throw exception (user Id and follower Id are equals)', async () => {
      const followerId = 1;
      const userId = 1;
      const followData = { followerId, userId };
      try {
        await followersService.follow(followData);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(usersService.getUserById).toBeCalledTimes(0);
        expect(model.findOne).toBeCalledTimes(0);
        expect(model.create).toBeCalledTimes(0);
      }
    });
    it('should throw exception (user or follower was not found)', async () => {
      const followerId = 1;
      const userId = 2;
      const follower = { id: followerId };
      const followData = { followerId, userId };
      const getUserByIdFn = jest.spyOn(usersService, 'getUserById').mockImplementation((id: number) => {
        if (id === followerId) return Promise.resolve(follower as User);
        else if (id === userId) return Promise.resolve(null);
      });
      try {
        await followersService.follow(followData);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
        expect(getUserByIdFn).toBeCalledTimes(2);
        expect(getUserByIdFn).toBeCalledWith(followerId);
        expect(getUserByIdFn).toBeCalledWith(userId);
        expect(model.findOne).toBeCalledTimes(0);
        expect(model.create).toBeCalledTimes(0);
      }
    });
    it('should throw exception (follow row already exists)', async () => {
      const followerId = 1;
      const userId = 2;
      const follower = { id: followerId };
      const user = { id: userId };
      const uuid = 'sdfsdfs';
      const followData = { followerId, userId };
      const getUserByIdFn = jest.spyOn(usersService, 'getUserById').mockImplementation((id: number) => {
        if (id === followerId) return Promise.resolve(follower as User);
        else if (id === userId) return Promise.resolve(user as User);
      });
      const findOneFn = jest.spyOn(model, 'findOne').mockImplementation(async () => {
        return Promise.resolve({
          followerId,
          userId,
          uuid,
        } as Follower);
      });
      try {
        await followersService.follow(followData);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe(
          ErrorMessages.ru.USER_M_IS_ALREADY_A_FOLLOWER_OF_USER_N.format(followData.followerId, followData.userId),
        );
        expect(getUserByIdFn).toBeCalledTimes(2);
        expect(getUserByIdFn).toBeCalledWith(followerId);
        expect(getUserByIdFn).toBeCalledWith(userId);
        expect(findOneFn).toBeCalledTimes(1);
        expect(findOneFn).toBeCalledWith({ where: followData });
        expect(model.create).toBeCalledTimes(0);
      }
    });
  });

  describe('FollowersService - unfollow', () => {
    it('should be successful result', async () => {
      const followerId = 1;
      const userId = 2;
      const follower = { id: followerId };
      const user = { id: userId };
      const uuid = 'sdfsdfs';
      const unfollowData = { followerId, userId };
      const getUserByIdFn = jest.spyOn(usersService, 'getUserById').mockImplementation((id: number) => {
        if (id === followerId) return Promise.resolve(follower as User);
        else if (id === userId) return Promise.resolve(user as User);
      });
      const findOneFn = jest.spyOn(model, 'findOne').mockImplementation(async () => {
        return Promise.resolve({
          followerId,
          userId,
          uuid,
        } as Follower);
      });
      const destroyFn = jest.spyOn(model, 'destroy').mockImplementation(async () => {
        return Promise.resolve(1);
      });
      const result = await followersService.unfollow(unfollowData);
      expect(result).toBeTruthy();
      expect(getUserByIdFn).toBeCalledTimes(2);
      expect(getUserByIdFn).toBeCalledWith(followerId);
      expect(getUserByIdFn).toBeCalledWith(userId);
      expect(findOneFn).toBeCalledTimes(1);
      expect(findOneFn).toBeCalledWith({ where: unfollowData });
      expect(destroyFn).toBeCalledTimes(1);
      expect(destroyFn).toBeCalledWith({ where: { uuid } });
    });
    it('should throw exception (user Id and follower Id are equals)', async () => {
      const followerId = 1;
      const userId = 1;
      const unfollowData = { followerId, userId };
      try {
        await followersService.unfollow(unfollowData);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(usersService.getUserById).toBeCalledTimes(0);
        expect(model.findOne).toBeCalledTimes(0);
        expect(model.create).toBeCalledTimes(0);
      }
    });
    it('should throw exception (user or follower was not found)', async () => {
      const followerId = 1;
      const userId = 2;
      const follower = { id: followerId };
      const unfollowData = { followerId, userId };
      const getUserByIdFn = jest.spyOn(usersService, 'getUserById').mockImplementation((id: number) => {
        if (id === followerId) return Promise.resolve(follower as User);
        else if (id === userId) return Promise.resolve(null);
      });
      try {
        await followersService.unfollow(unfollowData);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
        expect(getUserByIdFn).toBeCalledTimes(2);
        expect(getUserByIdFn).toBeCalledWith(followerId);
        expect(getUserByIdFn).toBeCalledWith(userId);
        expect(model.findOne).toBeCalledTimes(0);
        expect(model.create).toBeCalledTimes(0);
      }
    });
    it('should throw exception (follow row does not exist)', async () => {
      const followerId = 1;
      const userId = 2;
      const follower = { id: followerId };
      const user = { id: userId };
      const unfollowData = { followerId, userId };
      const getUserByIdFn = jest.spyOn(usersService, 'getUserById').mockImplementation((id: number) => {
        if (id === followerId) return Promise.resolve(follower as User);
        else if (id === userId) return Promise.resolve(user as User);
      });
      const findOneFn = jest.spyOn(model, 'findOne').mockImplementation(async () => {
        return Promise.resolve(null);
      });
      try {
        await followersService.unfollow(unfollowData);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe(
          ErrorMessages.ru.USER_M_IS_NOT_A_FOLLOWER_OF_USER_N.format(unfollowData.followerId, unfollowData.userId),
        );
        expect(getUserByIdFn).toBeCalledTimes(2);
        expect(getUserByIdFn).toBeCalledWith(followerId);
        expect(getUserByIdFn).toBeCalledWith(userId);
        expect(findOneFn).toBeCalledTimes(1);
        expect(findOneFn).toBeCalledWith({ where: unfollowData });
        expect(model.create).toBeCalledTimes(0);
      }
    });
  });

  describe('FollowersService - findFollowRows', () => {
    it('should return 4 rows', async () => {
      const followerId = 1;
      const userIds = [2, 3, 4, 5];
      jest.spyOn(model, 'findAll').mockImplementation((options: FindOptions) => {
        const result = [];

        const userIdsObject = options.where['userId'];
        const sym = Object.getOwnPropertySymbols(userIdsObject)[0];
        const userIds = userIdsObject[sym] as [];
        const followerId = options.where['followerId'];
        if (followerId) {
          if (userIds.some(el => el === 2)) result.push({ followerId, userId: 2 });
          if (userIds.some(el => el === 3)) result.push({ followerId, userId: 3 });
          if (userIds.some(el => el === 4)) result.push({ followerId, userId: 4 });
          if (userIds.some(el => el === 5)) result.push({ followerId, userId: 5 });
        }
        return Promise.resolve(result as Follower[]);
      });
      const response = await followersService.findFollowRows(followerId, userIds);
      expect(response.length).toBe(4);
      expect(model.findAll).toBeCalledTimes(1);
      expect(model.findAll).toBeCalledWith({ where: { followerId, userId: { [Op.in]: userIds } } });
    });
    it('should return 1 row', async () => {
      const followerId = 1;
      const userIds = [2];
      jest.spyOn(model, 'findAll').mockImplementation(async (options: FindOptions) => {
        const result = [];

        const userIdsObject = options.where['userId'];
        const sym = Object.getOwnPropertySymbols(userIdsObject)[0];
        const userIds = userIdsObject[sym] as [];
        const followerId = options.where['followerId'];
        if (followerId) {
          if (userIds.some(el => el === 2)) result.push({ followerId, userId: 2 });
          if (userIds.some(el => el === 3)) result.push({ followerId, userId: 3 });
          if (userIds.some(el => el === 4)) result.push({ followerId, userId: 4 });
          if (userIds.some(el => el === 5)) result.push({ followerId, userId: 5 });
        }
        return result;
      });
      const response = await followersService.findFollowRows(followerId, userIds);
      expect(response.length).toBe(1);
      expect(model.findAll).toBeCalledTimes(1);
      expect(model.findAll).toBeCalledWith({ where: { followerId, userId: { [Op.in]: userIds } } });
    });
    it('should return 1 row', async () => {
      const followerId = 1;
      const userIds = [2, 3, 4];
      jest.spyOn(model, 'findAll').mockImplementation(async () => {
        return [];
      });
      const response = await followersService.findFollowRows(followerId, userIds);
      expect(response.length).toBe(0);
      expect(model.findAll).toBeCalledTimes(1);
      expect(model.findAll).toBeCalledWith({ where: { followerId, userId: { [Op.in]: userIds } } });
    });
  });
});
