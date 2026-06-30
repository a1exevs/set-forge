import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDV4 } from 'sequelize';

import { User } from '@users/users.model';
import { WorkoutList } from '@workout-lists/workout-list.model';
import { WorkoutSessionExercise } from '@workout-sessions/workout-session-exercise.model';
import { SESSION_STATUS, SESSION_STATUSES, SessionStatus } from '@workout-sessions/constants/session-status';

interface IWorkoutSession {
  userId: number;
  workoutListId: string | null;
  workoutListName: string;
  status: SessionStatus;
  startedAt: Date;
  finishedAt: Date | null;
}

@Table({
  tableName: 'workout_sessions',
  createdAt: false,
  updatedAt: false,
  underscored: true,
  charset: 'utf8',
  collate: 'utf8_general_ci',
})
export class WorkoutSession extends Model<WorkoutSession, IWorkoutSession> {
  @ApiProperty({ example: 'c9d4e6f1-...', description: 'Unique workout session identifier' })
  @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: UUIDV4 })
  id: string;

  @ForeignKey(() => User)
  @ApiProperty({ example: 1, description: 'Owner user identifier' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @ForeignKey(() => WorkoutList)
  @ApiProperty({
    example: 'a3f1c0e2-...',
    description: 'Source workout list identifier (null when the list was deleted)',
    nullable: true,
  })
  @Column({ type: DataType.UUID, allowNull: true })
  workoutListId: string | null;

  @ApiProperty({ example: 'Push Day', description: 'Workout list name captured at session start' })
  @Column({ type: DataType.STRING, allowNull: false })
  workoutListName: string;

  @ApiProperty({ enum: SESSION_STATUSES, example: SESSION_STATUS.ACTIVE, description: 'Session status' })
  @Column({ type: DataType.STRING, allowNull: false, defaultValue: SESSION_STATUS.ACTIVE })
  status: SessionStatus;

  @ApiProperty({ example: '2026-06-03T12:00:00.000Z', description: 'Session start date' })
  @Column({ type: DataType.DATE, allowNull: false })
  startedAt: Date;

  @ApiProperty({ example: '2026-06-03T13:00:00.000Z', description: 'Session finish date', nullable: true })
  @Column({ type: DataType.DATE, allowNull: true })
  finishedAt: Date | null;

  @BelongsTo(() => WorkoutList)
  workoutList: WorkoutList;

  @HasMany(() => WorkoutSessionExercise)
  exercises: WorkoutSessionExercise[];
}
