import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { FindOptions, UniqueConstraintError } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

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
    @InjectConnection() private sequelize: Sequelize,
  ) {}

  async createUser(dto: CreateUserRequest.Dto): Promise<User> {
    const role = await this.roleService.getRoleByValue('user');
    if (!role) {
      throw AppException.of(HttpStatus.SERVICE_UNAVAILABLE, 'USER_ROLE_CONFIGURATION_IS_MISSING');
    }
    try {
      // The user and its role are stored together or not at all (session/user-has-role).
      return await this.sequelize.transaction(async transaction => {
        // A created user has accepted the current versions (session/acceptance-stamps).
        const user = await this.userRepository.create(
          {
            ...dto,
            acceptedTermsVersion: DocumentVersions.terms(),
            acceptedPrivacyVersion: DocumentVersions.privacy(),
            acceptedAt: new Date(),
          },
          { transaction },
        );
        await user.$set('roles', [role.id], { transaction });
        user.roles = [role];
        return user;
      });
    } catch (e) {
      // Two inserts racing for one email meet at the unique index; the loser is told the email is taken
      // (session/email-unique).
      if (e instanceof UniqueConstraintError) {
        throw AppException.of(HttpStatus.CONFLICT, 'USER_ALREADY_EXISTS', {}, e);
      }
      throw AppException.of(HttpStatus.BAD_REQUEST, 'FAILED_TO_CREATE_USER', {}, e);
    }
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
