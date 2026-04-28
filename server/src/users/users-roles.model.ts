import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '@users/users.model';
import { Role } from '@roles/roles.model';

@Table({ tableName: 'users_roles', createdAt: false, updatedAt: false, underscored: true })
export class UserRole extends Model<UserRole> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ForeignKey(() => User)
  @ApiProperty({ example: '1', description: 'Идентификатор Пользователя' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @ForeignKey(() => Role)
  @ApiProperty({ example: '1', description: 'Идентификатор Роли' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  roleId: number;
}
