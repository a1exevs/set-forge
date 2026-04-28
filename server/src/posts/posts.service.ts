import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { CreatePostRequest } from '@posts/dto';
import { Post } from '@posts/posts.model';
import { FilesService } from '@files/files.service';
import { ErrorMessages } from '@common/constants';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post) private postRepository: typeof Post, private fileService: FilesService) {}

  async createPost(dto: CreatePostRequest.Dto, image: any, userID: number): Promise<Post> {
    let post: Post;
    const { fileURL } = await this.fileService.createFile(image, null, 'jpg', 'posts_images');
    try {
      post = await this.postRepository.create({ ...dto, userId: userID, image: fileURL });
    } catch (e) {
      throw new BadRequestException(`${ErrorMessages.ru.FAILED_TO_CREATE_POST}. ${e.message}`);
    }
    return post;
  }
}
