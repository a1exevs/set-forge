import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '@users/users.model';

interface IUserContact {
  userId: number;
}

@Table({
  tableName: 'user_contacts',
  createdAt: false,
  updatedAt: false,
  underscored: true,
  charset: 'utf8',
  collate: 'utf8_general_ci',
})
export class UserContact extends Model<UserContact, IUserContact> {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор контактов пользователя' })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  /**
   * @todo НЕ РАБОТАЕТ FOREIGN kEY
   */
  @ForeignKey(() => User)
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор пользователя' })
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  userId: number;

  @ApiProperty({ example: 'facebook.com/george', description: 'Ссылка на страницу в Facebook' })
  @Column({ type: DataType.STRING })
  facebook: string;

  @ApiProperty({ example: 'super-site.com', description: 'Ссылка на личный веб-сайт' })
  @Column({ type: DataType.STRING })
  website: string;

  @ApiProperty({ example: 'twitter.com/george', description: 'Ссылка на страницу в Twitter' })
  @Column({ type: DataType.STRING })
  twitter: string;

  @ApiProperty({ example: 'instagram.com/george', description: 'Ссылка на страницу в Instagram' })
  @Column({ type: DataType.STRING })
  instagram: string;

  @ApiProperty({ example: 'youtube.com/george', description: 'Ссылка на страницу Youtube' })
  @Column({ type: DataType.STRING })
  youtube: string;

  @ApiProperty({ example: 'github.com/george', description: 'Ссылка на страницу Github' })
  @Column({ type: DataType.STRING })
  github: string;

  @ApiProperty({ example: 'vk.com/george', description: 'Ссылка на страницу в ВК' })
  @Column({ type: DataType.STRING })
  vk: string;

  @ApiProperty({ example: 'mainLink.com/george', description: 'Главная ссылка' })
  @Column({ type: DataType.STRING })
  mainLink: string;
}
