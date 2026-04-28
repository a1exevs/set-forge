import { validateDto } from '@test/unit/helpers';
import { BanUserRequest } from '@users/dto/ban-user.request';
import { ErrorMessages } from '@common/constants';

describe('BanUserRequest', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should be successful result', async () => {
      const dto = new BanUserRequest.Dto(1, 'reason');
      const errors = await validateDto(BanUserRequest.Dto, dto);
      expect(errors.length).toBe(0);
    });
    it('should has errors (values have incorrect types)', async () => {
      const dto = new BanUserRequest.Dto('1', 1);
      const errors = await validateDto(BanUserRequest.Dto, dto);
      expect(errors[0].constraints.isNumber).toBe(ErrorMessages.ru.MUST_BE_A_NUMBER);
      expect(errors[0].property).toBe('userId');
      expect(errors[1].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
      expect(errors[1].property).toBe('banReason');
    });
  });
});
