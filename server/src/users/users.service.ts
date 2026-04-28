import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions } from 'sequelize';

import { User } from '@users/users.model';
import { CreateUserRequest, AddRoleRequest, BanUserRequest, SetUserStatusRequest, GetUsersResponse } from '@users/dto';
import { RolesService } from '@roles/roles.service';
import { FollowersService } from '@followers/followers.service';
import { ProfilesService } from '@profiles/profiles.service';
import { ErrorMessages } from '@common/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private roleService: RolesService,
    private followersService: FollowersService,
    private profilesService: ProfilesService,
  ) {}

  async createUser(dto: CreateUserRequest.Dto): Promise<User> {
    const role = await this.roleService.getRoleByValue('user');
    if (!role)
      throw new HttpException(
        `${
          ErrorMessages.ru.SERVICE_IS_UNAVAILABLE
        }: ${ErrorMessages.ru.USER_ROLE_CONFIGURATION_IS_MISSING.toLowerCase()}`,
        HttpStatus.FORBIDDEN,
      );
    let user: User;
    try {
      user = await this.userRepository.create(dto);
    } catch (e) {
      throw new HttpException(`${ErrorMessages.ru.FAILED_TO_CREATE_USER}. ${e.message}`, HttpStatus.BAD_REQUEST);
    }
    await user.$set('roles', [role.id]);
    user.roles = [role];
    return user;
  }

  async getUsers(page: number, count: number, userId: number): Promise<GetUsersResponse.Data> {
    const users: User[] = await this.userRepository.findAll({
      offset: Number((page - 1) * count),
      limit: Number(count),
    });
    const totalCount = await this.userRepository.count();

    const userIds = users.map(user => user.id);
    const followRows = await this.followersService.findFollowRows(userId, userIds);

    const userItems = await Promise.all(
      users.map(async (user): Promise<GetUsersResponse.User> => {
        const profile = await this.profilesService.getUserProfile(user.id);
        return new GetUsersResponse.User({
          id: user.id,
          email: user.email,
          status: user.status,
          followed: followRows.some(row => row.userId === user.id),
          avatar: profile.photos,
        });
      }),
    );

    return new GetUsersResponse.Data({
      items: userItems,
      totalCount,
    });
  }

  public async getUserByEmail(email: string, withAllData = false) {
    // TODO Вынести формирование объекта FindOptions в хэлпер
    const findOptions: FindOptions = {
      where: { email },
    };
    if (withAllData) findOptions.include = { all: true };

    return this.userRepository.findOne(findOptions);
  }

  async getUserById(id: number) {
    return this.userRepository.findOne({ where: { id }, include: { all: true } });
  }

  async addRole(dto: AddRoleRequest.Dto) {
    const user = await this.userRepository.findByPk(dto.userId, { include: { all: true } });
    if (!user) {
      throw new NotFoundException(ErrorMessages.ru.FAILED_TO_FIND_USER);
    }

    const hasRole = user.roles.some(role => role.value === dto.value);
    if (hasRole) {
      throw new BadRequestException(ErrorMessages.ru.USER_ALREADY_HAS_THE_ROLE_N.format(dto.value));
    }

    const role = await this.roleService.getRoleByValue(dto.value);
    if (!role) {
      throw new NotFoundException(ErrorMessages.ru.FAILED_TO_FIND_ROLE);
    }

    await user.$add('roles', role.id);
    return user;
  }

  async ban(dto: BanUserRequest.Dto) {
    const user = await this.userRepository.findByPk(dto.userId);
    if (!user) {
      throw new NotFoundException(ErrorMessages.ru.FAILED_TO_FIND_USER);
    }

    user.banned = true;
    user.banReason = dto.banReason;
    await user.save();
    return user;
  }

  async getStatus(userId: number): Promise<{ status: string }> {
    const status: { status: string } = await this.userRepository.findOne({
      attributes: ['status'],
      where: { id: userId },
    });
    if (!status) {
      throw new NotFoundException();
    }
    return status;
  }

  public async setStatus(dto: SetUserStatusRequest.Dto, userId: number) {
    return this.userRepository.update({ status: dto.status }, { where: { id: userId }, returning: true });
  }
}
