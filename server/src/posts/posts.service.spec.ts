import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { HttpException, HttpStatus } from '@nestjs/common';

import { FilesService } from '@files/files.service';
import { loadTestFile, removeTestStaticDir, TEST_FILE_ORIGINAL_NAME, TEST_FILE_PATH } from '@test/unit/helpers';
import { PostsService } from '@posts/posts.service';
import { Post } from '@posts/posts.model';
import { CreatePostRequest } from '@posts/dto';
import { sendPseudoError } from '@test/unit/helpers';
import { ErrorMessages } from '@common/constants';

describe('PostsService', () => {
  let postsService: PostsService;
  let model: typeof Post;
  let filesService: FilesService;
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post),
          useValue: { create: jest.fn(x => x) },
        },
        {
          provide: FilesService,
          useValue: { createFile: jest.fn(x => x) },
        },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    model = module.get<typeof Post>(getModelToken(Post));
    filesService = module.get<FilesService>(FilesService);
  });

  afterEach(async () => {
    removeTestStaticDir();
  });

  describe('PostsService - definition', () => {
    it('PostsService - should be defined', () => {
      expect(postsService).toBeDefined();
    });
    it('Post - should be defined', () => {
      expect(model).toBeDefined();
    });
    it('FilesService - should be defined', () => {
      expect(filesService).toBeDefined();
    });
  });

  describe('PostsService - createPost', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const postId = 1;
      const title = 'It is test post';
      const content = 'It is content of test post';
      const dto: CreatePostRequest.Dto = { title, content };
      const file = loadTestFile(TEST_FILE_PATH, 20000000, 'image/jpeg', TEST_FILE_ORIGINAL_NAME);
      const imageURL = 'test-server.com/posts-images/sowa.jpg';

      jest.spyOn(filesService, 'createFile').mockImplementation(async () => {
        return Promise.resolve({ filePath: 'test', fileURL: imageURL });
      });
      jest.spyOn(model, 'create').mockImplementation(async () => {
        return Promise.resolve({
          id: postId,
          userId,
          title,
          content,
          image: imageURL,
        } as Post);
      });

      const post = await postsService.createPost(dto, file, userId);
      expect(post.id).toBe(postId);
      expect(post.title).toBe(title);
      expect(post.content).toBe(content);
      expect(post.image).toBe(imageURL);
      expect(filesService.createFile).toBeCalledTimes(1);
      expect(model.create).toBeCalledTimes(1);
      expect(model.create).toBeCalledWith({
        userId,
        title,
        content,
        image: imageURL,
      });
    });
    it('should throw exception when try to create a post', async () => {
      expect.assertions(5);
      const userId = 1;
      const title = 'It is test post';
      const content = 'It is content of test post';
      const dto: CreatePostRequest.Dto = { title, content };
      const file = loadTestFile(TEST_FILE_PATH, 20000000, 'image/jpeg', TEST_FILE_ORIGINAL_NAME);
      const imageURL = 'test-server.com/posts-images/sowa.jpg';
      const errorMessage = 'DB Error';

      jest.spyOn(filesService, 'createFile').mockImplementation(async () => {
        return Promise.resolve({ filePath: 'test', fileURL: imageURL });
      });
      jest.spyOn(model, 'create').mockImplementation(async () => {
        throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
      });

      try {
        await postsService.createPost(dto, file, userId);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe(`${ErrorMessages.ru.FAILED_TO_CREATE_POST}. ${errorMessage}`);
        expect(filesService.createFile).toBeCalledTimes(1);
        expect(model.create).toBeCalledTimes(1);
        expect(model.create).toBeCalledWith({
          userId,
          title,
          content,
          image: imageURL,
        });
      }
    });
  });
});
