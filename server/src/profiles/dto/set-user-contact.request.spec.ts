import { validateDto } from '@test/unit/helpers';
import { SetUserContactRequest } from '@profiles/dto';
import { ErrorMessages } from '@common/constants';

describe('SetUserContactRequest', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should be successful result', async () => {
      const dto = new SetUserContactRequest.Dto(
        'facebook',
        'website',
        'twitter',
        'instagram',
        'youtube',
        'github',
        'vk',
        'mainLink',
      );

      const errors = await validateDto(SetUserContactRequest.Dto, dto);
      expect(errors.length).toBe(0);
    });
    it('should has errors (values are not strings)', async () => {
      const dto = new SetUserContactRequest.Dto(1, 2, 3, 4, 5, 6, 7, 8);
      const errors = await validateDto(SetUserContactRequest.Dto, dto);
      expect.assertions(1 + Object.keys(dto).length * 2);
      expect(errors.length).toBe(Object.keys(dto).length);
      errors.forEach((error, index: number) => {
        expect(error.constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
        expect(error.property).toBe(Object.keys(dto)[index]);
      });
    });
  });
});
