import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '@users/users.model';

interface IUserCommonInfo {
  userId: number;
  fullName: string;
}

@Table({
  tableName: 'user_common_info',
  createdAt: false,
  updatedAt: false,
  underscored: true,
  charset: 'utf8',
  collate: 'utf8_general_ci',
})
export class UserCommonInfo extends Model<UserCommonInfo, IUserCommonInfo> {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор Профиля пользователя' })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  /**
   * @todo НЕ РАБОТАЕТ FOREIGN kEY
   */
  @ForeignKey(() => User)
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор пользователя' })
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  userId: number;

  @ApiProperty({ example: 'Гарри Поттер', description: 'Полное имя пользователя' })
  @Column({ type: DataType.STRING, allowNull: false })
  fullName: string;

  @ApiProperty({ example: 'Frontend-developer', description: 'Данные пользователя' })
  @Column({ type: DataType.STRING })
  aboutMe: string;

  @ApiProperty({ example: false, description: 'Ищет ли Пользователь работу' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  lookingForAJob: boolean;

  @ApiProperty({ example: 'Ищу работу удаленно', description: 'Описания искомой вакансии' })
  @Column({ type: DataType.STRING })
  lookingForAJobDescription: string;
}
