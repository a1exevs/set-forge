import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDV4 } from 'sequelize';

import { User } from '@users/users.model';

@Table({ tableName: 'refreshTokens', createdAt: false, updatedAt: false, underscored: true })
export class RefreshToken extends Model<RefreshToken> {
  @ApiProperty({ example: 1, description: 'Unique token identifier' })
  @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: UUIDV4 })
  uuid: string;

  @ApiProperty({ example: 1, description: 'Unique user identifier' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  @ForeignKey(() => User)
  userId: number;

  @ApiProperty({ example: true, description: 'Whether the token is revoked' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isRevoked: boolean;

  @ApiProperty({ example: '162222222', description: 'Token expiration date' })
  @Column({ type: DataType.DATE, allowNull: false })
  expires: Date;
}
