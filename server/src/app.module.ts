import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';

import { UsersModule, User, UserRole } from '@src/users';
import { RolesModule, Role } from '@src/roles';
import { AuthModule, RefreshToken } from '@src/auth';
import { FilesModule } from '@src/files';
import { ProfilesModule, UserCommonInfo, UserContact, UserAvatar } from '@src/profiles';
import { LoggerModule } from '@src/logger';
import { SecurityModule } from '@src/security';
import { HealthModule } from '@src/health/health.module';

import * as path from 'path';

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
      models: [User, Role, UserRole, RefreshToken, UserCommonInfo, UserContact, UserAvatar],
      autoLoadModels: true,
      // Schema is owned by sequelize-cli migrations under server/database/migrations.
      // Keep this `false` in every environment so dev and prod share one source of truth
      // and accidental model edits never silently mutate the database.
      synchronize: false,
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    FilesModule,
    ProfilesModule,
    LoggerModule,
    SecurityModule,
  ],
})
export class AppModule {}
