import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions } from 'sequelize';

import { DocumentVersions } from '@common/constants';
import { AppException } from '@common/exceptions';
import { RolesService } from '@roles/roles.service';
import { CreateUserRequest } from '@users/dto';
import { User } from '@users/users.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private roleService: RolesService,
  ) {}

  async createUser(dto: CreateUserRequest.Dto): Promise<User> {
    const role = await this.roleService.getRoleByValue('user');
    if (!role) {
      throw AppException.of(HttpStatus.FORBIDDEN, 'USER_ROLE_CONFIGURATION_IS_MISSING');
    }
    let user: User;
    try {
      // A created user has accepted the current versions (session/acceptance-stamps).
      user = await this.userRepository.create({
        ...dto,
        acceptedTermsVersion: DocumentVersions.terms(),
        acceptedPrivacyVersion: DocumentVersions.privacy(),
        acceptedAt: new Date(),
      });
    } catch (e) {
      throw AppException.of(HttpStatus.BAD_REQUEST, 'FAILED_TO_CREATE_USER', {}, e);
    }
    await user.$set('roles', [role.id]);
    user.roles = [role];
    return user;
  }

  /** Stamps the current document versions and the time as accepted (session/acceptance-stamps). */
  async updateDocumentAcceptance(userId: number): Promise<void> {
    await this.userRepository.update(
      {
        acceptedTermsVersion: DocumentVersions.terms(),
        acceptedPrivacyVersion: DocumentVersions.privacy(),
        acceptedAt: new Date(),
      },
      { where: { id: userId } },
    );
  }

  public async getUserByEmail(email: string, withAllData = false) {
    const findOptions: FindOptions = {
      where: { email },
    };
    if (withAllData) {
      findOptions.include = { all: true };
    }

    return this.userRepository.findOne(findOptions);
  }

  async getUserById(id: number) {
    return this.userRepository.findOne({ where: { id }, include: { all: true } });
  }

  /**
   * Deletes the user row; the `ON DELETE CASCADE` keys remove the rest (session/deletion-cascade). A `where`-based
   * destroy issues one DELETE, so InnoDB applies the cascade.
   */
  async deleteUser(id: number): Promise<boolean> {
    const deletedCount = await this.userRepository.destroy({ where: { id } });
    return deletedCount > 0;
  }
}
