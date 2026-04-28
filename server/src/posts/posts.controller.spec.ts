import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { REQUEST } from '@nestjs/core';

import { JwtAuthGuard, RefreshTokenGuard } from '@common/guards';
import { PostsService } from '@posts/posts.service';
import { PostsController } from '@posts/posts.controller';
import { CreatePostRequest } from '@posts/dto';
import { loadTestFile, TEST_FILE_ORIGINAL_NAME, TEST_FILE_PATH } from '@test/unit/helpers';
import { Post } from '@posts/posts.model';

describe('PostsController', () => {
  let postsController: PostsController;
  let postsService: PostsService;
  let jwtAuthGuard: JwtAuthGuard;
  let refreshTokenGuard: RefreshTokenGuard;
  const userId = 1;

  beforeEach(async () => {
    jest.clearAllMocks();

    const jwtService = { provide: JwtService, useValue: {} };
    const req = { user: { id: userId } };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            createPost: jest.fn(x => x),
          },
        },
        jwtService,
      ],
    })
      .overrideProvider(REQUEST)
      .useValue(req)
      .compile();
    postsController = moduleRef.get<PostsController>(PostsController);
    postsService = moduleRef.get<PostsService>(PostsService);
    jwtAuthGuard = moduleRef.get<JwtAuthGuard>(JwtAuthGuard);
    refreshTokenGuard = moduleRef.get<RefreshTokenGuard>(RefreshTokenGuard);
  });

  describe('PostsController - definition', () => {
    it('PostsController - should be defined', () => {
      expect(postsController).toBeDefined();
    });
    it('PostsService - should be defined', () => {
      expect(postsService).toBeDefined();
    });
    it('JwtAuthGuard - should be defined', () => {
      expect(jwtAuthGuard).toBeDefined();
    });
    it('RefreshTokenGuard - should be defined', () => {
      expect(refreshTokenGuard).toBeDefined();
    });
  });

  describe('PostsController - create', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const postId = 1;
      const title = 'It is test post';
      const content = 'It is content of test post';
      const dto: CreatePostRequest.Dto = { title, content };
      const file = loadTestFile(TEST_FILE_PATH, 20000000, 'image/jpeg', TEST_FILE_ORIGINAL_NAME);
      jest.spyOn(postsService, 'createPost').mockImplementation(() => {
        return Promise.resolve({
          id: postId,
          title,
          content,
          image: TEST_FILE_ORIGINAL_NAME,
          userId,
        } as Post);
      });

      const post = await postsController.create(dto, file);

      expect(post.id).toBe(postId);
      expect(post.userId).toBe(userId);
      expect(post.title).toBe(title);
      expect(post.content).toBe(content);
      expect(post.image).toBe(TEST_FILE_ORIGINAL_NAME);
    });
  });
});
