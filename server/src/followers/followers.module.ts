import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { FollowersController } from '@followers/followers.controller';
import { FollowersService } from '@followers/followers.service';
import { UsersModule } from '@users/users.module';
import { Follower } from '@followers/followers.model';
import { AuthModule } from '@auth/auth.module';

@Module({
  controllers: [FollowersController],
  providers: [FollowersService],
  imports: [SequelizeModule.forFeature([Follower]), forwardRef(() => UsersModule), AuthModule],
  exports: [FollowersService],
})
export class FollowersModule {}
