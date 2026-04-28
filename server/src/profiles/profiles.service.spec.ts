import '@root/string.extensions';

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';

import { ProfilesService } from '@profiles/profiles.service';
import { UserAvatarsService } from '@profiles/user-avatars.service';
import { UserCommonInfoService } from '@profiles/user-common-Info.service';
import { UserContactsService } from '@profiles/user-contacts.service';
import { UsersService } from '@users/users.service';
import { FilesService } from '@files/files.service';
import { UserCommonInfo } from '@profiles/user-common-info.model';
import { UserAvatar } from '@profiles/user-avatars.model';
import { UserContact } from '@profiles/user-contacts.model';
import { User } from '@users/users.model';
import { SetProfileRequest } from '@profiles/dto';
import { sendPseudoError, loadTestFile, TEST_FILE_ORIGINAL_NAME, TEST_FILE_PATH } from '@test/unit/helpers';
import { ErrorMessages } from '@common/constants';

describe('ProfilesController', () => {
  let profilesService: ProfilesService;
  let userAvatarsService: UserAvatarsService;
  let userCommonInfoService: UserCommonInfoService;
  let userContactsService: UserContactsService;
  let usersService: UsersService;
  let filesService: FilesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: UserAvatarsService,
          useValue: {
            getAvatarByUserId: jest.fn(x => x),
            setAvatarData: jest.fn(x => x),
          },
        },
        {
          provide: UserCommonInfoService,
          useValue: {
            getCommonInfoByUserId: jest.fn(x => x),
            setCommonInfo: jest.fn(x => x),
          },
        },
        {
          provide: UserContactsService,
          useValue: {
            getContactsByUserId: jest.fn(x => x),
            setContacts: jest.fn(x => x),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getUserById: jest.fn(x => x),
          },
        },
        {
          provide: FilesService,
          useValue: {
            addJPEGFile: jest.fn(x => x),
          },
        },
      ],
    }).compile();
    profilesService = moduleRef.get<ProfilesService>(ProfilesService);
    userAvatarsService = moduleRef.get<UserAvatarsService>(UserAvatarsService);
    userCommonInfoService = moduleRef.get<UserCommonInfoService>(UserCommonInfoService);
    userContactsService = moduleRef.get<UserContactsService>(UserContactsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    filesService = moduleRef.get<FilesService>(FilesService);
  });

  describe('ProfilesService - definition', () => {
    it('ProfilesService - should be defined', () => {
      expect(profilesService).toBeDefined();
    });
    it('UserAvatarsService - should be defined', () => {
      expect(userAvatarsService).toBeDefined();
    });
    it('UserCommonInfoService - should be defined', () => {
      expect(userCommonInfoService).toBeDefined();
    });
    it('UserContactsService - should be defined', () => {
      expect(userContactsService).toBeDefined();
    });
    it('UsersService - should be defined', () => {
      expect(usersService).toBeDefined();
    });
    it('FilesService - should be defined', () => {
      expect(filesService).toBeDefined();
    });
  });

  describe('ProfilesService - getProfile', () => {
    it('should be successful', async () => {
      const userId = 1;
      const fullName = 'lord Voldemort';
      const aboutMe = 'I am super wizard in the World';
      const lookingForAJob = false;
      const lookingForAJobDescription = "I don't need to work. I need to seize power in the world of magicians";
      const largeUploadedPhotoURL = 'sowa.com/profiles/1/large-photo';
      const smallUploadedPhotoURL = 'sowa.com/profiles/1/small-photo';
      const vk = 'volodya.vk.com';
      const facebook = 'volodya.facebook.com';
      const github = 'volodya.github.com';
      const twitter = 'volodya.twitter.com';
      const instagram = 'volodya.instagram.com';
      const mainLink = 'volodya.mainLink.com';
      const website = 'volodya.website.com';
      const youtube = 'volodya.youtube.com';
      const commonInfo: Partial<UserCommonInfo> = {
        fullName,
        aboutMe,
        lookingForAJob,
        lookingForAJobDescription,
      };
      const avatar: Partial<UserAvatar> = {
        small: smallUploadedPhotoURL,
        large: largeUploadedPhotoURL,
      };
      const contact: Partial<UserContact> = {
        vk,
        facebook,
        github,
        twitter,
        instagram,
        mainLink,
        website,
        youtube,
      };
      const user: Partial<User> = { id: userId };
      jest.spyOn(usersService, 'getUserById').mockImplementation(() => {
        return Promise.resolve(user as User);
      });
      jest.spyOn(userCommonInfoService, 'getCommonInfoByUserId').mockImplementation(() => {
        return Promise.resolve(commonInfo as UserCommonInfo);
      });
      jest.spyOn(userAvatarsService, 'getAvatarByUserId').mockImplementation(() => {
        return Promise.resolve(avatar as UserAvatar);
      });
      jest.spyOn(userContactsService, 'getContactsByUserId').mockImplementation(() => {
        return Promise.resolve(contact as UserContact);
      });

      const profileData = await profilesService.getUserProfile(userId);

      expect(profileData.fullName).toBe(fullName);
      expect(profileData.aboutMe).toBe(aboutMe);
      expect(profileData.lookingForAJob).toBe(lookingForAJob);
      expect(profileData.lookingForAJobDescription).toBe(lookingForAJobDescription);
      expect(profileData.contacts).toEqual(contact);
      expect(profileData.photos).toEqual(avatar);
      expect(usersService.getUserById).toBeCalledTimes(1);
      expect(usersService.getUserById).toBeCalledWith(userId);
      expect(userAvatarsService.getAvatarByUserId).toBeCalledTimes(1);
      expect(userAvatarsService.getAvatarByUserId).toBeCalledWith(userId);
      expect(userCommonInfoService.getCommonInfoByUserId).toBeCalledTimes(1);
      expect(userCommonInfoService.getCommonInfoByUserId).toBeCalledWith(userId);
      expect(userContactsService.getContactsByUserId).toBeCalledTimes(1);
      expect(userContactsService.getContactsByUserId).toBeCalledWith(userId);
    });
    it('should be successful result (with empty fields if data does not exist yet)', async () => {
      const userId = 1;
      const user: Partial<User> = { id: userId };
      jest.spyOn(usersService, 'getUserById').mockImplementation(() => {
        return Promise.resolve(user as User);
      });
      jest.spyOn(userCommonInfoService, 'getCommonInfoByUserId').mockImplementation(() => {
        return Promise.resolve(null);
      });
      jest.spyOn(userAvatarsService, 'getAvatarByUserId').mockImplementation(() => {
        return Promise.resolve(null);
      });
      jest.spyOn(userContactsService, 'getContactsByUserId').mockImplementation(() => {
        return Promise.resolve(null);
      });

      const profileData = await profilesService.getUserProfile(userId);

      expect(profileData.fullName).toBe('');
      expect(profileData.aboutMe).toBe('');
      expect(profileData.lookingForAJob).toBe(false);
      expect(profileData.lookingForAJobDescription).toBe('');
      expect(profileData.contacts.vk).toBe('');
      expect(profileData.contacts.github).toBe('');
      expect(profileData.contacts.facebook).toBe('');
      expect(profileData.contacts.twitter).toBe('');
      expect(profileData.contacts.instagram).toBe('');
      expect(profileData.contacts.mainLink).toBe('');
      expect(profileData.contacts.website).toBe('');
      expect(profileData.contacts.youtube).toBe('');
      expect(profileData.photos.large).toEqual('');
      expect(profileData.photos.small).toEqual('');
      expect(userAvatarsService.getAvatarByUserId).toBeCalledTimes(1);
      expect(userAvatarsService.getAvatarByUserId).toBeCalledWith(userId);
      expect(usersService.getUserById).toBeCalledTimes(1);
      expect(usersService.getUserById).toBeCalledWith(userId);
      expect(userCommonInfoService.getCommonInfoByUserId).toBeCalledTimes(1);
      expect(userCommonInfoService.getCommonInfoByUserId).toBeCalledWith(userId);
      expect(userContactsService.getContactsByUserId).toBeCalledTimes(1);
      expect(userContactsService.getContactsByUserId).toBeCalledWith(userId);
    });
    it('should throw exception (user with ID was not found', async () => {
      const userId = 2;
      jest.spyOn(usersService, 'getUserById').mockImplementation(() => {
        return Promise.resolve(null);
      });

      try {
        await profilesService.getUserProfile(userId);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe(ErrorMessages.ru.USER_N_NOT_FOUND.format(userId));
        expect(usersService.getUserById).toBeCalledTimes(1);
        expect(usersService.getUserById).toBeCalledWith(userId);
        expect(userAvatarsService.getAvatarByUserId).toBeCalledTimes(0);
        expect(userCommonInfoService.getCommonInfoByUserId).toBeCalledTimes(0);
        expect(userContactsService.getContactsByUserId).toBeCalledTimes(0);
      }
    });
  });

  describe('ProfilesService - setUserProfile', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const fullName = 'lord Voldemort';
      const aboutMe = 'I am super wizard in the World';
      const lookingForAJob = false;
      const lookingForAJobDescription = "I don't need to work. I need to seize power in the world of magicians";
      const vk = 'volodya.vk.com';
      const facebook = 'volodya.facebook.com';
      const github = 'volodya.github.com';
      const twitter = 'volodya.twitter.com';
      const instagram = 'volodya.instagram.com';
      const mainLink = 'volodya.mainLink.com';
      const website = 'volodya.website.com';
      const youtube = 'volodya.youtube.com';
      const commonInfo: Partial<UserCommonInfo> = {
        fullName,
        aboutMe,
        lookingForAJob,
        lookingForAJobDescription,
      };
      const contact: Partial<UserContact> = {
        vk,
        facebook,
        github,
        twitter,
        instagram,
        mainLink,
        website,
        youtube,
      };
      const user: Partial<User> = { id: userId };
      const dto: SetProfileRequest.Dto = {
        fullName,
        aboutMe,
        lookingForAJob,
        lookingForAJobDescription,
        contacts: {
          vk,
          facebook,
          github,
          twitter,
          instagram,
          mainLink,
          website,
          youtube,
        },
      };

      jest.spyOn(usersService, 'getUserById').mockImplementation(() => {
        return Promise.resolve(user as User);
      });
      jest.spyOn(userCommonInfoService, 'setCommonInfo').mockImplementation(() => {
        return Promise.resolve(commonInfo as UserCommonInfo);
      });
      jest.spyOn(userContactsService, 'setContacts').mockImplementation(() => {
        return Promise.resolve(contact as UserContact);
      });

      const profileData = await profilesService.setUserProfile(userId, dto);

      expect(profileData.lookingForAJob).toBe(lookingForAJob);
      expect(profileData.lookingForAJobDescription).toBe(lookingForAJobDescription);
      expect(profileData.fullName).toBe(fullName);
      expect(profileData.aboutMe).toBe(aboutMe);
      expect(profileData.contacts).toEqual(contact);
      expect(usersService.getUserById).toBeCalledTimes(1);
      expect(usersService.getUserById).toBeCalledWith(userId);
      expect(userCommonInfoService.setCommonInfo).toBeCalledTimes(1);
      expect(userCommonInfoService.setCommonInfo).toBeCalledWith(userId, dto);
      expect(userContactsService.setContacts).toBeCalledTimes(1);
      expect(userContactsService.setContacts).toBeCalledWith(userId, dto.contacts);
      expect(userContactsService.getContactsByUserId).toBeCalledTimes(0);
    });
    it('should be successful result (without contacts data)', async () => {
      const userId = 1;
      const fullName = 'lord Voldemort';
      const aboutMe = 'I am super wizard in the World';
      const lookingForAJob = false;
      const lookingForAJobDescription = "I don't need to work. I need to seize power in the world of magicians";
      const commonInfo: Partial<UserCommonInfo> = {
        fullName,
        aboutMe,
        lookingForAJob,
        lookingForAJobDescription,
      };
      const user: Partial<User> = { id: userId };
      const dto: SetProfileRequest.Dto = {
        fullName,
        aboutMe,
        lookingForAJob,
        lookingForAJobDescription,
      };

      jest.spyOn(usersService, 'getUserById').mockImplementation(() => {
        return Promise.resolve(user as User);
      });
      jest.spyOn(userCommonInfoService, 'setCommonInfo').mockImplementation(() => {
        return Promise.resolve(commonInfo as UserCommonInfo);
      });
      jest.spyOn(userContactsService, 'getContactsByUserId').mockImplementation(() => {
        return Promise.resolve(null);
      });

      const profileData = await profilesService.setUserProfile(userId, dto);

      expect(profileData.lookingForAJob).toBe(lookingForAJob);
      expect(profileData.lookingForAJobDescription).toBe(lookingForAJobDescription);
      expect(profileData.fullName).toBe(fullName);
      expect(profileData.aboutMe).toBe(aboutMe);
      expect(profileData.contacts.mainLink).toBe('');
      expect(profileData.contacts.website).toBe('');
      expect(profileData.contacts.youtube).toBe('');
      expect(profileData.contacts.twitter).toBe('');
      expect(profileData.contacts.instagram).toBe('');
      expect(profileData.contacts.vk).toBe('');
      expect(profileData.contacts.github).toBe('');
      expect(profileData.contacts.facebook).toBe('');
      expect(usersService.getUserById).toBeCalledTimes(1);
      expect(usersService.getUserById).toBeCalledWith(userId);
      expect(userCommonInfoService.setCommonInfo).toBeCalledTimes(1);
      expect(userCommonInfoService.setCommonInfo).toBeCalledWith(userId, dto);
      expect(userContactsService.getContactsByUserId).toBeCalledTimes(1);
      expect(userContactsService.getContactsByUserId).toBeCalledWith(userId);
      expect(userContactsService.setContacts).toBeCalledTimes(0);
    });
    it('should throw exception (user with ID was not found)', async () => {
      const userId = 2;
      jest.spyOn(usersService, 'getUserById').mockImplementation(() => {
        return Promise.resolve(null);
      });

      try {
        await profilesService.setUserProfile(userId, null);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe(ErrorMessages.ru.USER_N_NOT_FOUND.format(userId));
        expect(usersService.getUserById).toBeCalledTimes(1);
        expect(usersService.getUserById).toBeCalledWith(userId);
        expect(userCommonInfoService.setCommonInfo).toBeCalledTimes(0);
        expect(userContactsService.setContacts).toBeCalledTimes(0);
        expect(userContactsService.getContactsByUserId).toBeCalledTimes(0);
      }
    });
  });

  describe('ProfilesService - setUserProfilePhoto', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const user: Partial<User> = { id: userId };
      const photo = loadTestFile(TEST_FILE_PATH, 20000000, 'image/jpeg', TEST_FILE_ORIGINAL_NAME);
      const originalImageURL = 'originalImageURL';
      const smallImageURL = 'smallImageURL';
      jest.spyOn(usersService, 'getUserById').mockImplementation(() => {
        return Promise.resolve(user as User);
      });
      jest.spyOn(filesService, 'addJPEGFile').mockImplementation(() => {
        return Promise.resolve({
          originalImageURL,
          originalImagePath: 'originalImagePath',
          smallImageURL,
          smallImagePath: 'smallImagePath',
        });
      });
      jest.spyOn(userAvatarsService, 'setAvatarData').mockImplementation(() => {
        return Promise.resolve({
          userId,
          large: originalImageURL,
          small: smallImageURL,
        } as UserAvatar);
      });

      const profilePhotoData = await profilesService.setUserProfilePhoto(photo, userId);

      expect(profilePhotoData.photos.small).toBe(smallImageURL);
      expect(profilePhotoData.photos.large).toBe(originalImageURL);
      expect(usersService.getUserById).toBeCalledTimes(1);
      expect(usersService.getUserById).toBeCalledWith(userId);
      expect(filesService.addJPEGFile).toBeCalledTimes(1);
      expect(filesService.addJPEGFile).toBeCalledWith(photo, '', `/users/${userId}/`);
      expect(userAvatarsService.setAvatarData).toBeCalledTimes(1);
      expect(userAvatarsService.setAvatarData).toBeCalledWith(
        { small: smallImageURL, large: originalImageURL },
        userId,
      );
    });
    it('should throw exception (user with ID was not found)', async () => {
      const userId = 1;
      const photo = loadTestFile(TEST_FILE_PATH, 20000000, 'image/jpeg', TEST_FILE_ORIGINAL_NAME);
      jest.spyOn(usersService, 'getUserById').mockImplementation(() => {
        return Promise.resolve(null);
      });

      try {
        await profilesService.setUserProfilePhoto(photo, userId);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe(ErrorMessages.ru.USER_N_NOT_FOUND.format(userId));
        expect(usersService.getUserById).toBeCalledTimes(1);
        expect(usersService.getUserById).toBeCalledWith(userId);
        expect(filesService.addJPEGFile).toBeCalledTimes(0);
        expect(userAvatarsService.setAvatarData).toBeCalledTimes(0);
      }
    });
    it('should throw exception (image adding error)', async () => {
      const userId = 1;
      const user: Partial<User> = { id: userId };
      const file = null;
      const errorMessage = ErrorMessages.ru.FILE_NOT_SELECTED;
      jest.spyOn(usersService, 'getUserById').mockImplementation(() => {
        return Promise.resolve(user as User);
      });
      jest.spyOn(filesService, 'addJPEGFile').mockImplementation(() => {
        throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
      });
      try {
        await profilesService.setUserProfilePhoto(file, userId);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe(errorMessage);
        expect(usersService.getUserById).toBeCalledTimes(1);
        expect(usersService.getUserById).toBeCalledWith(userId);
        expect(filesService.addJPEGFile).toBeCalledTimes(1);
        expect(filesService.addJPEGFile).toBeCalledWith(file, '', `/users/${userId}/`);
        expect(userAvatarsService.setAvatarData).toBeCalledTimes(0);
      }
    });
  });
});
