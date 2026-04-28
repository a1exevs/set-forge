import { CreatePostRequest } from '@posts/dto';
import { validateDto } from '@test/unit/helpers';
import { ErrorMessages } from '@common/constants';

describe('CreatePostRequest', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should be successful result', async () => {
      const dto: CreatePostRequest.Dto = { title: 'title', content: 'content' };
      const errors = await validateDto(CreatePostRequest.Dto, dto);
      expect(errors.length).toBe(0);
    });
    it('should has errors (values are not strings)', async () => {
      const dto = new CreatePostRequest.Dto(1, 1);
      const errors = await validateDto(CreatePostRequest.Dto, dto);
      expect(errors.length).toBe(2);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
      expect(errors[1].property).toBe('content');
      expect(errors[1].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
    });
  });
});
