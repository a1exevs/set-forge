import { Table, Column, Model, DataType, ForeignKey, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDV4 } from 'sequelize';

import { User } from '@users/users.model';
import { WorkoutExercise } from '@workout-lists/workout-exercise.model';

interface IWorkoutList {
  userId: number;
  name: string;
  description: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}

@Table({
  tableName: 'workout_lists',
  createdAt: false,
  updatedAt: false,
  underscored: true,
  charset: 'utf8',
  collate: 'utf8_general_ci',
})
export class WorkoutList extends Model<WorkoutList, IWorkoutList> {
  @ApiProperty({ example: 'a3f1c0e2-...', description: 'Unique workout list identifier' })
  @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: UUIDV4 })
  id: string;

  @ForeignKey(() => User)
  @ApiProperty({ example: 1, description: 'Owner user identifier' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @ApiProperty({ example: 'Push Day', description: 'Workout list name' })
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ApiProperty({ example: 'Chest, shoulders, triceps', description: 'Workout list description' })
  @Column({ type: DataType.STRING, allowNull: false, defaultValue: '' })
  description: string;

  @ApiProperty({ example: '2026-06-03T12:00:00.000Z', description: 'Creation date' })
  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-03T12:00:00.000Z', description: 'Last used date', nullable: true })
  @Column({ type: DataType.DATE, allowNull: true })
  lastUsedAt: Date | null;

  @HasMany(() => WorkoutExercise)
  exercises: WorkoutExercise[];
}
