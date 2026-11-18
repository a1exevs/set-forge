import { ApiProperty } from '@nestjs/swagger';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { User } from '@users/users.model';

@Table({ tableName: 'trusted_devices', createdAt: false, updatedAt: false, underscored: true })
export class TrustedDevice extends Model<TrustedDevice> {
  @ApiProperty({ example: 1, description: 'Unique record identifier' })
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ApiProperty({ example: 1, description: 'The user who signed in on the device' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ApiProperty({
    example: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    description: 'SHA-256 of the device token, hex; the token itself is never stored',
  })
  @Column({ type: DataType.CHAR(64), allowNull: false })
  tokenHash: string;

  @ApiProperty({
    example: '2027-02-16T12:00:00.000Z',
    description: 'When the trust ends unless the user signs in again',
  })
  @Column({ type: DataType.DATE, allowNull: false })
  expires: Date;
}
