import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';

import { UsersModule, User, UserRole } from '@src/users';
import { RolesModule, Role } from '@src/roles';
import { AuthModule, RefreshToken } from '@src/auth';
import { PostsModule, Post } from '@src/posts';
import { FilesModule } from '@src/files';
import { ProfilesModule, UserCommonInfo, UserContact, UserAvatar } from '@src/profiles';
import { LoggerModule } from '@src/logger';
import { SecurityModule } from '@src/security';
import { FollowersModule, Follower } from '@src/followers';

import * as path from 'path';

@Module({
  controllers: [],
  providers: [],
  imports: [
    ConfigModule.forRoot({
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
      models: [User, Role, UserRole, Post, RefreshToken, UserCommonInfo, UserContact, UserAvatar, Follower],
      autoLoadModels: true,
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    PostsModule,
    FilesModule,
    ProfilesModule,
    LoggerModule,
    SecurityModule,
    FollowersModule,
  ],
})
export class AppModule {}
