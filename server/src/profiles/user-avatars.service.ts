import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { UserAvatar } from '@profiles/user-avatars.model';
import { SetUserAvatarRequest } from '@profiles/dto';

@Injectable()
export class UserAvatarsService {
  constructor(@InjectModel(UserAvatar) private avatarRepository: typeof UserAvatar) {}

  public async getAvatarByUserId(userId: number): Promise<UserAvatar> {
    return this.avatarRepository.findOne({ where: { userId } });
  }

  public async setAvatarData(dto: SetUserAvatarRequest.Dto, userId: number): Promise<UserAvatar> {
    await this.avatarRepository.upsert({ userId, ...dto });
    return this.getAvatarByUserId(userId);
  }
}
