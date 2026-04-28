import { validateDto } from '@test/unit/helpers';
import { LoginRequest } from '@auth/dto';
import { ErrorMessages } from '@common/constants';

describe('LoginRequest', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should be successful result', async () => {
      const dto = new LoginRequest.Dto('test@gmail.com', '12345678');
      const errors = await validateDto(LoginRequest.Dto, dto);
      expect(errors.length).toBe(0);
    });
    it('should be successful result (with captcha)', async () => {
      const dto = new LoginRequest.Dto('test@gmail.com', '12345678', '1234');
      const errors = await validateDto(LoginRequest.Dto, dto);
      expect(errors.length).toBe(0);
    });
    it('should has errors (values are not strings)', async () => {
      const dto = new LoginRequest.Dto(1, 1);
      const errors = await validateDto(LoginRequest.Dto, dto);
      expect(errors.length).toBe(2);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
      expect(errors[0].constraints.isEmail).toBeUndefined();
      expect(errors[1].property).toBe('password');
      expect(errors[1].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
      expect(errors[1].constraints.isLength).toBeUndefined();
    });
    it('should has errors (values are not strings. With captcha)', async () => {
      const dto = new LoginRequest.Dto(1, 1, 1);
      const errors = await validateDto(LoginRequest.Dto, dto);
      expect(errors.length).toBe(3);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
      expect(errors[0].constraints.isEmail).toBeUndefined();
      expect(errors[1].property).toBe('password');
      expect(errors[1].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
      expect(errors[1].constraints.isLength).toBeUndefined();
      expect(errors[2].property).toBe('captcha');
      expect(errors[2].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
    });
  });
});
