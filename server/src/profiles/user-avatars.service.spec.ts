import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';

import { UserAvatarsService } from '@profiles/user-avatars.service';
import { UserAvatar } from '@profiles/user-avatars.model';

describe('UserAvatarsService', () => {
  let userAvatarsService: UserAvatarsService;
  let model: typeof UserAvatar;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAvatarsService,
        {
          provide: getModelToken(UserAvatar),
          useValue: {
            findOne: jest.fn(x => x),
            upsert: jest.fn(x => x),
          },
        },
      ],
    }).compile();
    userAvatarsService = module.get<UserAvatarsService>(UserAvatarsService);
    model = module.get<typeof UserAvatar>(getModelToken(UserAvatar));
  });

  describe('UserAvatarsService - definition', () => {
    it('UserAvatarsService - should be defined', () => {
      expect(userAvatarsService).toBeDefined();
    });
    it('Avatar - should be defined', () => {
      expect(model).toBeDefined();
    });
  });

  describe('UserAvatarsService - getAvatarByUserId', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const small = 'small';
      const large = 'large';
      jest.spyOn(model, 'findOne').mockImplementation(() => {
        return Promise.resolve({ userId, small, large } as UserAvatar);
      });
      const avatar = await userAvatarsService.getAvatarByUserId(userId);
      expect(avatar.userId).toBe(userId);
      expect(avatar.small).toBe(small);
      expect(avatar.large).toBe(large);
      expect(model.findOne).toBeCalledTimes(1);
      expect(model.findOne).toBeCalledWith({ where: { userId } });
    });
  });

  describe('UserAvatarsService - setAvatarData', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const small = 'small';
      const large = 'large';
      const avatarData = { small, large };
      jest.spyOn(model, 'findOne').mockImplementation(() => {
        return Promise.resolve({ userId, ...avatarData } as UserAvatar);
      });
      jest.spyOn(model, 'upsert').mockImplementation(() => {
        return Promise.resolve([avatarData as UserAvatar, true]);
      });
      const result = await userAvatarsService.setAvatarData(avatarData, userId);
      expect(result.userId).toBe(userId);
      expect(result.small).toBe(small);
      expect(result.large).toBe(large);
      expect(model.upsert).toBeCalledTimes(1);
      expect(model.upsert).toBeCalledWith({ small, large, userId });
      expect(model.findOne).toBeCalledTimes(1);
      expect(model.findOne).toBeCalledWith({ where: { userId } });
    });
  });
});
