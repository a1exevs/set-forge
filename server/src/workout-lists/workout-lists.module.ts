import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from '@auth/auth.module';
import { WorkoutListsController } from '@workout-lists/workout-lists.controller';
import { WorkoutListsService } from '@workout-lists/workout-lists.service';
import { WorkoutList } from '@workout-lists/workout-list.model';
import { WorkoutExercise } from '@workout-lists/workout-exercise.model';

@Module({
  controllers: [WorkoutListsController],
  providers: [WorkoutListsService],
  imports: [SequelizeModule.forFeature([WorkoutList, WorkoutExercise]), AuthModule],
  exports: [WorkoutListsService],
})
export class WorkoutListsModule {}
