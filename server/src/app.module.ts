import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

import { AuthModule, RefreshToken } from '@src/auth';
import { HealthModule } from '@src/health/health.module';
import { LoggerModule } from '@src/logger';
import { Role, RolesModule } from '@src/roles';
import { SecurityModule } from '@src/security';
import { User, UserRole, UsersModule } from '@src/users';
import { WorkoutExercise, WorkoutList, WorkoutListsModule } from '@src/workout-lists';
import { WorkoutSession, WorkoutSessionExercise, WorkoutSessionsModule } from '@src/workout-sessions';

@Module({
  controllers: [],
  providers: [],
  imports: [
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '../', process.env.SERVER_STATIC || 'static'),
    }),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
      models: [
        User,
        Role,
        UserRole,
        RefreshToken,
        WorkoutList,
        WorkoutExercise,
        WorkoutSession,
        WorkoutSessionExercise,
      ],
      autoLoadModels: true,
      // Schema is owned by sequelize-cli migrations under server/database/migrations.
      // Keep this `false` in every environment so dev and prod share one source of truth
      // and accidental model edits never silently mutate the database.
      synchronize: false,
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    LoggerModule,
    SecurityModule,
    WorkoutListsModule,
    WorkoutSessionsModule,
  ],
})
export class AppModule {}
