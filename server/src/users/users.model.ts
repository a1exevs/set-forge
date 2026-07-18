import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

import { Role } from '@roles/roles.model';
import { UserRole } from '@users/users-roles.model';

interface IUser {
  email: string;
  password: string;
  acceptedTermsVersion?: number | null;
  acceptedPrivacyVersion?: number | null;
  acceptedAt?: Date | null;
}

@Table({
  tableName: 'users',
  createdAt: false,
  updatedAt: false,
  underscored: true,
  charset: 'utf8',
  collate: 'utf8_general_ci',
})
export class User extends Model<User, IUser> {
  @ApiProperty({ example: 1, description: 'Unique user identifier' })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  email: string;

  @ApiProperty({ example: '1234', description: 'User account password' })
  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @ApiProperty({ example: 1, description: 'Accepted Terms of Use version', nullable: true })
  @Column({ type: DataType.INTEGER, allowNull: true })
  acceptedTermsVersion: number | null;

  @ApiProperty({ example: 1, description: 'Accepted Privacy Policy version', nullable: true })
  @Column({ type: DataType.INTEGER, allowNull: true })
  acceptedPrivacyVersion: number | null;

  @ApiProperty({ example: '2026-07-18T12:00:00.000Z', description: 'When the documents were accepted', nullable: true })
  @Column({ type: DataType.DATE, allowNull: true })
  acceptedAt: Date | null;

  @BelongsToMany(() => Role, () => UserRole)
  roles: Role[];
}
