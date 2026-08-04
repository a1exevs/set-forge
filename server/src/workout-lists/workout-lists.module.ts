import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from '@auth/auth.module';
import { JwtAuthGuard, RefreshTokenGuard } from '@common/guards';
import { WorkoutExercise } from '@workout-lists/workout-exercise.model';
import { WorkoutList } from '@workout-lists/workout-list.model';
import { WorkoutListsController } from '@workout-lists/workout-lists.controller';
import { WorkoutListsService } from '@workout-lists/workout-lists.service';
import { WorkoutSessionsModule } from '@workout-sessions/workout-sessions.module';

@Module({
  controllers: [WorkoutListsController],
  providers: [WorkoutListsService, JwtAuthGuard, RefreshTokenGuard],
  imports: [SequelizeModule.forFeature([WorkoutList, WorkoutExercise]), WorkoutSessionsModule, AuthModule],
  exports: [WorkoutListsService],
})
export class WorkoutListsModule {}
