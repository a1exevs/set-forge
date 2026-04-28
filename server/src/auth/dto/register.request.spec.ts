import '@root/string.extensions';

import { RegisterRequest } from '@auth/dto';
import { validateDto } from '@test/unit/helpers';
import { ErrorMessages } from '@common/constants';

describe('RegisterRequest', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should be successful result', async () => {
      const dto = new RegisterRequest.Dto('test@gmail.com', '12345678');
      const errors = await validateDto(RegisterRequest.Dto, dto);
      expect(errors.length).toBe(0);
    });
    it('should be successful result (password has 50 symbols', async () => {
      const dto = new RegisterRequest.Dto('test@gmail.com', '12345678901234567890123456789012345678901234567890');
      const errors = await validateDto(RegisterRequest.Dto, dto);
      expect(errors.length).toBe(0);
    });
    it('should has errors (values are not strings)', async () => {
      const dto = new RegisterRequest.Dto(1, 1);
      const errors = await validateDto(RegisterRequest.Dto, dto);
      expect(errors.length).toBe(2);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
      expect(errors[0].constraints.isEmail).toBe(ErrorMessages.ru.MUST_HAS_EMAIL_FORMAT);
      expect(errors[1].property).toBe('password');
      expect(errors[1].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
      expect(errors[1].constraints.isLength).toBe(
        ErrorMessages.ru.STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N.format(8, 50),
      );
    });
    it('should has error (incorrect email)', async () => {
      const dto = new RegisterRequest.Dto('emailmailcom', '12345678');
      const errors = await validateDto(RegisterRequest.Dto, dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints.isString).toBeUndefined();
      expect(errors[0].constraints.isEmail).toBe(ErrorMessages.ru.MUST_HAS_EMAIL_FORMAT);
    });
    it('should has error (password has less symbols than 8)', async () => {
      const dto = new RegisterRequest.Dto('email@mail.com', '1234567');
      const errors = await validateDto(RegisterRequest.Dto, dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints.isString).toBeUndefined();
      expect(errors[0].constraints.isLength).toBe(
        ErrorMessages.ru.STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N.format(8, 50),
      );
    });
    it('should has error (password has greater symbols than 50)', async () => {
      const dto = new RegisterRequest.Dto('email@mail.com', '123456789012345678901234567890123456789012345678901');
      const errors = await validateDto(RegisterRequest.Dto, dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints.isString).toBeUndefined();
      expect(errors[0].constraints.isLength).toBe(
        ErrorMessages.ru.STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N.format(8, 50),
      );
    });
  });
});
