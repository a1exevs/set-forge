import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions } from 'sequelize';

import { User } from '@users/users.model';
import { CreateUserRequest } from '@users/dto';
import { RolesService } from '@roles/roles.service';
import { ErrorMessages } from '@common/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private roleService: RolesService,
  ) {}

  async createUser(dto: CreateUserRequest.Dto): Promise<User> {
    const role = await this.roleService.getRoleByValue('user');
    if (!role)
      throw new HttpException(
        `${
          ErrorMessages.SERVICE_IS_UNAVAILABLE
        }: ${ErrorMessages.USER_ROLE_CONFIGURATION_IS_MISSING.toLowerCase()}`,
        HttpStatus.FORBIDDEN,
      );
    let user: User;
    try {
      user = await this.userRepository.create(dto);
    } catch (e) {
      throw new HttpException(`${ErrorMessages.FAILED_TO_CREATE_USER}. ${e.message}`, HttpStatus.BAD_REQUEST);
    }
    await user.$set('roles', [role.id]);
    user.roles = [role];
    return user;
  }

  public async getUserByEmail(email: string, withAllData = false) {
    const findOptions: FindOptions = {
      where: { email },
    };
    if (withAllData) findOptions.include = { all: true };

    return this.userRepository.findOne(findOptions);
  }

  async getUserById(id: number) {
    return this.userRepository.findOne({ where: { id }, include: { all: true } });
  }
}
