import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Role } from '@roles/roles.model';
import { CreateRoleRequest } from '@roles/dto';
import { ErrorMessages } from '@common/constants';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role) private roleRepository: typeof Role) {}

  async createRole(dto: CreateRoleRequest.Dto) {
    let role: Role;
    try {
      role = await this.roleRepository.create(dto);
    } catch (e) {
      throw new BadRequestException(`${ErrorMessages.ru.FAILED_TO_CREATE_ROLE}. ${e.message}`);
    }
    return role;
  }

  async getRoleByValue(value: string) {
    return this.roleRepository.findOne({ where: { value } });
  }
}
