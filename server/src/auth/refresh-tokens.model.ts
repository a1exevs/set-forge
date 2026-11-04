import { ApiProperty } from '@nestjs/swagger';
import { UUIDV4 } from 'sequelize';
import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { User } from '@users/users.model';

@Table({ tableName: 'refreshTokens', createdAt: false, updatedAt: false, underscored: true })
export class RefreshToken extends Model<RefreshToken> {
  @ApiProperty({ example: '0b6f8a52-4c7e-4d3a-9a51-2f7b3c1d9e10', description: 'Unique token identifier' })
  @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: UUIDV4 })
  uuid: string;

  @ApiProperty({ example: 1, description: 'Unique user identifier' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  @ForeignKey(() => User)
  userId: number;

  @ApiProperty({
    example: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    description: 'SHA-256 of the token, hex; the token itself is never stored',
  })
  @Column({ type: DataType.CHAR(64), allowNull: false, unique: true })
  tokenHash: string;

  @ApiProperty({ example: '2026-12-04T12:00:00.000Z', description: 'Token expiration date' })
  @Column({ type: DataType.DATE, allowNull: false })
  expires: Date;
}
