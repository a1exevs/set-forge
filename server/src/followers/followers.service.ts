import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Follower, IFollower } from '@followers/followers.model';
import { UsersService } from '@users/users.service';
import { ErrorMessages } from '@common/constants';

@Injectable()
export class FollowersService {
  constructor(
    @InjectModel(Follower) private followerRepository: typeof Follower,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
  ) {}

  public async follow(followData: IFollower): Promise<boolean> {
    const uuid = await this.validateFollowRequest(followData);
    if (uuid) {
      throw new BadRequestException(
        ErrorMessages.ru.USER_M_IS_ALREADY_A_FOLLOWER_OF_USER_N.format(followData.followerId, followData.userId),
      );
    }

    return !!(await this.followerRepository.create(followData));
  }

  public async unfollow(unfollowData: IFollower): Promise<boolean> {
    const uuid = await this.validateFollowRequest(unfollowData);
    if (!uuid) {
      throw new BadRequestException(
        ErrorMessages.ru.USER_M_IS_NOT_A_FOLLOWER_OF_USER_N.format(unfollowData.followerId, unfollowData.userId),
      );
    }

    return !!(await this.followerRepository.destroy({ where: { uuid } }));
  }

  public async findFollowRows(followerId: number, userIds: number[]): Promise<Follower[]> {
    return this.followerRepository.findAll({
      where: {
        followerId,
        userId: { [Op.in]: userIds },
      },
    });
  }

  private async validateFollowRequest(followData: IFollower): Promise<string | null> {
    if (followData.followerId === followData.userId) {
      throw new BadRequestException();
    }

    const follower = await this.usersService.getUserById(followData.followerId);
    const user = await this.usersService.getUserById(followData.userId);
    if (!follower || !user) {
      throw new NotFoundException();
    }

    return this.existRow(followData);
  }

  private async existRow(followData: IFollower): Promise<string | null> {
    const row: Follower = await this.followerRepository.findOne({ where: { ...followData } });
    return row ? row.uuid : null;
  }
}
