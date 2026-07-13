import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDV4 } from 'sequelize';

import { WorkoutSession } from '@workout-sessions/workout-session.model';

interface IWorkoutSessionExercise {
  workoutSessionId: string;
  sourceExerciseId: string | null;
  name: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  sets: number;
  completedSets: number;
  position: number;
}

@Table({
  tableName: 'workout_session_exercises',
  createdAt: false,
  updatedAt: false,
  underscored: true,
  charset: 'utf8',
  collate: 'utf8_general_ci',
})
export class WorkoutSessionExercise extends Model<WorkoutSessionExercise, IWorkoutSessionExercise> {
  @ApiProperty({ example: 'd1f4a7c2-...', description: 'Unique session exercise identifier' })
  @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: UUIDV4 })
  id: string;

  @ForeignKey(() => WorkoutSession)
  @ApiProperty({ example: 'c9d4e6f1-...', description: 'Workout session identifier' })
  @Column({ type: DataType.UUID, allowNull: false })
  workoutSessionId: string;

  // TODO: add DB FK → workout_exercises.id (ON DELETE SET NULL) after list update uses
  // selective upsert instead of destroy-all + bulkCreate.
  @ApiProperty({
    example: 'b7e2d1f4-...',
    description: 'Source template exercise identifier used to resync progress (null when not linked)',
    nullable: true,
  })
  @Column({ type: DataType.UUID, allowNull: true })
  sourceExerciseId: string | null;

  @ApiProperty({ example: 'Bench Press', description: 'Exercise name' })
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ApiProperty({ example: 'chest', description: 'Muscle group' })
  @Column({ type: DataType.STRING, allowNull: false })
  muscleGroup: string;

  @ApiProperty({ example: 60, description: 'Weight (kg)' })
  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  weight: number;

  @ApiProperty({ example: 10, description: 'Number of repetitions' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  reps: number;

  @ApiProperty({ example: 3, description: 'Number of sets' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  sets: number;

  @ApiProperty({ example: 0, description: 'Number of completed sets' })
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  completedSets: number;

  @ApiProperty({ example: 0, description: 'Exercise position in the session' })
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  position: number;

  @BelongsTo(() => WorkoutSession)
  workoutSession: WorkoutSession;
}
