import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDV4 } from 'sequelize';

import { WorkoutList } from '@workout-lists/workout-list.model';

interface IWorkoutExercise {
  workoutListId: string;
  name: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  sets: number;
  position: number;
}

@Table({
  tableName: 'workout_exercises',
  createdAt: false,
  updatedAt: false,
  underscored: true,
  charset: 'utf8',
  collate: 'utf8_general_ci',
})
export class WorkoutExercise extends Model<WorkoutExercise, IWorkoutExercise> {
  @ApiProperty({ example: 'b7e2d1f4-...', description: 'Unique exercise identifier' })
  @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: UUIDV4 })
  id: string;

  @ForeignKey(() => WorkoutList)
  @ApiProperty({ example: 'a3f1c0e2-...', description: 'Workout list identifier' })
  @Column({ type: DataType.UUID, allowNull: false })
  workoutListId: string;

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

  @ApiProperty({ example: 0, description: 'Exercise position in the list' })
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  position: number;

  @BelongsTo(() => WorkoutList)
  workoutList: WorkoutList;
}
