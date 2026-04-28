import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { PostsController } from '@posts/posts.controller';
import { PostsService } from '@posts/posts.service';
import { Post } from '@posts/posts.model';
import { FilesModule } from '@files/files.module';
import { AuthModule } from '@auth/auth.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [SequelizeModule.forFeature([Post]), FilesModule, AuthModule],
})
export class PostsModule {}
