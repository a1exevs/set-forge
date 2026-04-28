import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';

import { UserCommonInfoService } from '@profiles/user-common-Info.service';
import { UserCommonInfo } from '@profiles/user-common-info.model';

describe('UserCommonInfoService', () => {
  let userCommonInfoService: UserCommonInfoService;
  let model: typeof UserCommonInfo;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCommonInfoService,
        {
          provide: getModelToken(UserCommonInfo),
          useValue: {
            findOne: jest.fn(x => x),
            upsert: jest.fn(x => x),
          },
        },
      ],
    }).compile();
    userCommonInfoService = module.get<UserCommonInfoService>(UserCommonInfoService);
    model = module.get<typeof UserCommonInfo>(getModelToken(UserCommonInfo));
  });

  describe('UserCommonInfoService - definition', () => {
    it('UserCommonInfoService - should be defined', () => {
      expect(userCommonInfoService).toBeDefined();
    });
    it('Profile - should be defined', () => {
      expect(model).toBeDefined();
    });
  });

  describe('UserCommonInfoService - getCommonInfoByUserId', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const fullName = 'lord Voldemort';
      const aboutMe = 'I am super wizard in the World';
      const lookingForAJob = false;
      const lookingForAJobDescription = "I don't need to work. I need to seize power in the world of magicians";
      const profile: Partial<UserCommonInfo> = {
        userId,
        fullName,
        aboutMe,
        lookingForAJob,
        lookingForAJobDescription,
      };
      jest.spyOn(model, 'findOne').mockImplementation(() => {
        return Promise.resolve(profile as UserCommonInfo);
      });
      const profileData = await userCommonInfoService.getCommonInfoByUserId(userId);

      expect(profileData.userId).toBe(userId);
      expect(profileData.fullName).toBe(fullName);
      expect(profileData.aboutMe).toBe(aboutMe);
      expect(profileData.lookingForAJob).toBe(lookingForAJob);
      expect(profileData.lookingForAJobDescription).toBe(lookingForAJobDescription);
      expect(model.findOne).toBeCalledTimes(1);
      expect(model.findOne).toBeCalledWith({ where: { userId } });
    });
  });

  describe('UserCommonInfoService - setCommonInfo', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const fullName = 'lord Voldemort';
      const aboutMe = 'I am super wizard in the World';
      const lookingForAJob = false;
      const lookingForAJobDescription = "I don't need to work. I need to seize power in the world of magicians";
      const profileData = {
        fullName,
        aboutMe,
        lookingForAJob,
        lookingForAJobDescription,
      };
      const profile: Partial<UserCommonInfo> = {
        userId,
        ...profileData,
      };
      jest.spyOn(model, 'findOne').mockImplementation(() => {
        return Promise.resolve(profile as UserCommonInfo);
      });
      jest.spyOn(model, 'upsert').mockImplementation(() => {
        return Promise.resolve([{} as UserCommonInfo, true]);
      });
      const result = await userCommonInfoService.setCommonInfo(userId, profileData);
      expect(result.userId).toBe(userId);
      expect(result.fullName).toBe(fullName);
      expect(result.aboutMe).toBe(aboutMe);
      expect(result.lookingForAJob).toBe(lookingForAJob);
      expect(result.lookingForAJobDescription).toBe(lookingForAJobDescription);
      expect(model.upsert).toBeCalledTimes(1);
      expect(model.upsert).toBeCalledWith({ ...profileData, userId }, { returning: true });
      expect(model.findOne).toBeCalledTimes(1);
      expect(model.findOne).toBeCalledWith({ where: { userId } });
    });
  });
});
