import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from '@auth/auth.module';
import { JwtAuthGuard, RefreshTokenGuard } from '@common/guards';
import { WorkoutList } from '@workout-lists/workout-list.model';
import { WorkoutExercise } from '@workout-lists/workout-exercise.model';
import { WorkoutSessionsController } from '@workout-sessions/workout-sessions.controller';
import { WorkoutSessionsService } from '@workout-sessions/workout-sessions.service';
import { WorkoutSession } from '@workout-sessions/workout-session.model';
import { WorkoutSessionExercise } from '@workout-sessions/workout-session-exercise.model';

@Module({
  controllers: [WorkoutSessionsController],
  providers: [WorkoutSessionsService, JwtAuthGuard, RefreshTokenGuard],
  imports: [
    SequelizeModule.forFeature([WorkoutSession, WorkoutSessionExercise, WorkoutList, WorkoutExercise]),
    AuthModule,
  ],
  exports: [WorkoutSessionsService],
})
export class WorkoutSessionsModule {}
