import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { HttpExceptionFilter } from '@common/exception-filters';
import { JwtAuthGuard, RefreshTokenGuard } from '@common/guards';
import { ResponseInterceptor } from '@common/interceptors';
import { ProfilesController } from '@profiles/profiles.controller';
import { ProfilesService } from '@profiles/profiles.service';
import { GetProfileResponse, SetProfileRequest } from '@profiles/dto';
import { loadTestFile, TEST_FILE_ORIGINAL_NAME, TEST_FILE_PATH } from '@test/unit/helpers';

describe('ProfilesController', () => {
  let profilesController: ProfilesController;
  let profilesService: ProfilesService;
  let httpExceptionFilter: HttpExceptionFilter;
  let jwtAuthGuard: JwtAuthGuard;
  let refreshTokenGuard: RefreshTokenGuard;
  let responseInterceptor: ResponseInterceptor<any>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    const jwtService = { provide: JwtService, useValue: {} };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        {
          provide: ProfilesService,
          useValue: {
            getUserProfile: jest.fn(x => x),
            setUserProfile: jest.fn(x => x),
            setUserProfilePhoto: jest.fn(x => x),
          },
        },
        jwtService,
      ],
    }).compile();
    profilesController = moduleRef.get<ProfilesController>(ProfilesController);
    profilesService = moduleRef.get<ProfilesService>(ProfilesService);
    httpExceptionFilter = moduleRef.get<HttpExceptionFilter>(HttpExceptionFilter);
    jwtAuthGuard = moduleRef.get<JwtAuthGuard>(JwtAuthGuard);
    refreshTokenGuard = moduleRef.get<RefreshTokenGuard>(RefreshTokenGuard);
    responseInterceptor = moduleRef.get<ResponseInterceptor<any>>(ResponseInterceptor);
  });

  describe('ProfilesController - definition', () => {
    it('ProfilesController - should be defined', () => {
      expect(profilesController).toBeDefined();
    });
    it('ProfilesService - should be defined', () => {
      expect(profilesService).toBeDefined();
    });
    it('HttpExceptionFilter - should be defined', () => {
      expect(httpExceptionFilter).toBeDefined();
    });
    it('JwtAuthGuard - should be defined', () => {
      expect(jwtAuthGuard).toBeDefined();
    });
    it('RefreshTokenGuard - should be defined', () => {
      expect(refreshTokenGuard).toBeDefined();
    });
    it('ResponseInterceptor - should be defined', () => {
      expect(responseInterceptor).toBeDefined();
    });
  });

  describe('ProfilesController - getProfile', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const fullName = 'lord Voldemort';
      const aboutMe = 'I am super wizard in the World';
      const lookingForAJob = false;
      const lookingForAJobDescription = "I don't need to work. I need to seize power in the world of magicians";
      const contacts = null;
      const photos = null;
      jest.spyOn(profilesService, 'getUserProfile').mockImplementation((): Promise<GetProfileResponse.Dto> => {
        return Promise.resolve({
          fullName,
          aboutMe,
          lookingForAJob,
          lookingForAJobDescription,
          contacts,
          photos,
        });
      });

      const profileData = await profilesController.getProfile(userId);

      expect(profileData.fullName).toBe(fullName);
      expect(profileData.aboutMe).toBe(aboutMe);
      expect(profileData.lookingForAJob).toBe(lookingForAJob);
      expect(profileData.lookingForAJobDescription).toBe(lookingForAJobDescription);
      expect(profileData.contacts).toBe(contacts);
      expect(profileData.photos).toBe(photos);
      expect(profilesService.getUserProfile).toBeCalledTimes(1);
      expect(profilesService.getUserProfile).toBeCalledWith(userId);
    });
  });

  describe('ProfilesController - setProfile', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const fullName = 'lord Voldemort';
      const aboutMe = 'I am super wizard in the World';
      const lookingForAJob = false;
      const lookingForAJobDescription = "I don't need to work. I need to seize power in the world of magicians";
      const contacts = null;
      const photos = null;
      const requestDto: SetProfileRequest.Dto = {
        fullName,
        aboutMe,
        lookingForAJob,
        lookingForAJobDescription,
        contacts,
      };
      jest.spyOn(profilesService, 'setUserProfile').mockImplementation((): Promise<GetProfileResponse.Dto> => {
        return Promise.resolve({
          ...requestDto,
          contacts: requestDto.contacts,
          photos,
        });
      });
      const req = { user: { id: userId } };

      const userProfile = await profilesController.setProfile(requestDto, req);

      expect(userProfile.fullName).toBe(fullName);
      expect(userProfile.aboutMe).toBe(aboutMe);
      expect(userProfile.lookingForAJob).toBe(lookingForAJob);
      expect(userProfile.lookingForAJobDescription).toBe(lookingForAJobDescription);
      expect(userProfile.contacts).toBe(contacts);
      expect(userProfile.photos).toBe(photos);
      expect(profilesService.setUserProfile).toBeCalledTimes(1);
      expect(profilesService.setUserProfile).toBeCalledWith(userId, requestDto);
    });
  });

  describe('ProfilesController - setProfilePhoto', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const req = { user: { id: userId } };
      const photo = loadTestFile(TEST_FILE_PATH, 20000000, 'image/jpeg', TEST_FILE_ORIGINAL_NAME);
      const largeUploadedPhotoURL = 'sowa.com/profiles/1/large-photo';
      const smallUploadedPhotoURL = 'sowa.com/profiles/1/small-photo';

      jest.spyOn(profilesService, 'setUserProfilePhoto').mockImplementation(() => {
        return Promise.resolve({
          photos: {
            large: largeUploadedPhotoURL,
            small: smallUploadedPhotoURL,
          },
        });
      });

      const result = await profilesController.setProfilePhoto(photo, req);

      expect(result.photos.large).toBe(largeUploadedPhotoURL);
      expect(result.photos.small).toBe(smallUploadedPhotoURL);
      expect(profilesService.setUserProfilePhoto).toBeCalledTimes(1);
      expect(profilesService.setUserProfilePhoto).toBeCalledWith(photo, userId);
    });
  });
});
