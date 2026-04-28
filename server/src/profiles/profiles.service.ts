import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';

import { UserCommonInfo } from '@profiles/user-common-info.model';
import { GetProfileResponse, GetUserContactResponse, GetUserAvatarResponse, SetProfileRequest } from '@profiles/dto';
import { UsersService } from '@users/users.service';
import { UserAvatar } from '@profiles/user-avatars.model';
import { UserCommonInfoService } from '@profiles/user-common-Info.service';
import { UserContactsService } from '@profiles/user-contacts.service';
import { UserAvatarsService } from '@profiles/user-avatars.service';
import { User } from '@users/users.model';
import { FilesService } from '@files/files.service';
import { ErrorMessages } from '@common/constants';
import { UserContact } from '@profiles/user-contacts.model';

@Injectable()
export class ProfilesService {
  constructor(
    private userCommonInfoService: UserCommonInfoService,
    private userContactsService: UserContactsService,
    private userAvatarsService: UserAvatarsService,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private fileService: FilesService,
  ) {}

  public async getUserProfile(userId: number): Promise<GetProfileResponse.Dto> {
    await this.validateUserId(userId);

    const profile = await this.userCommonInfoService.getCommonInfoByUserId(userId);
    const contact = await this.userContactsService.getContactsByUserId(userId);
    const avatar = await this.userAvatarsService.getAvatarByUserId(userId);

    return this.buildGetProfileResponse(profile, contact, avatar);
  }

  public async setUserProfile(userId: number, dto: SetProfileRequest.Dto): Promise<GetProfileResponse.Dto> {
    await this.validateUserId(userId);

    const profile = await this.userCommonInfoService.setCommonInfo(userId, dto);
    const contacts = dto.contacts
      ? await this.userContactsService.setContacts(userId, dto.contacts)
      : await this.userContactsService.getContactsByUserId(userId);

    return this.buildGetProfileResponse(profile, contacts, null);
  }

  public async setUserProfilePhoto(image: any, userId: number) {
    await this.validateUserId(userId);
    const { originalImageURL, smallImageURL } = await this.fileService.addJPEGFile(image, '', `/users/${userId}/`);
    const avatars = await this.userAvatarsService.setAvatarData(
      {
        small: smallImageURL,
        large: originalImageURL,
      },
      userId,
    );

    return this.buildGetUserProfilePhotoResponse(avatars);
  }

  /**
   * Сформировать ответ на основе сущностей, связанных с информацией о пользователе,
   * с учетом возможности отсутствия в БД этих данных (например, для нового пользователя)
   * @param commonInfo
   * @param contact
   * @param avatar
   * @private
   */
  private buildGetProfileResponse(
    commonInfo: UserCommonInfo,
    contact: UserContact,
    avatar: UserAvatar,
  ): GetProfileResponse.Dto {
    return new GetProfileResponse.Dto(
      commonInfo,
      new GetUserContactResponse.Dto(contact),
      new GetUserAvatarResponse.Dto(avatar),
    );
  }

  private async validateUserId(userId: number): Promise<User> {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new BadRequestException(ErrorMessages.ru.USER_N_NOT_FOUND.format(userId));
    }
    return user;
  }

  /**
   * Сформировать ответ на основе данных о фотографиях профиля пользователя
   * с учетом возможности отсутствия в БД этих данных (например, для нового пользователя)
   * @param avatars
   * @private
   */
  private buildGetUserProfilePhotoResponse(avatars: UserAvatar): { photos: GetUserAvatarResponse.Dto } {
    return { photos: new GetUserAvatarResponse.Dto(avatars) };
  }
}
