import '@root/string.extensions';

import { validateDto } from '@test/unit/helpers';
import { SetUserStatusRequest } from '@users/dto/set-user-status.request';
import { ErrorMessages } from '@common/constants';

describe('SetUserStatusRequest', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should be successful result', async () => {
      const dto: SetUserStatusRequest.Dto = { status: 'status' };
      const errors = await validateDto(SetUserStatusRequest.Dto, dto);
      expect(errors.length).toBe(0);
    });
    it('should be successful result (empties status)', async () => {
      const dto: SetUserStatusRequest.Dto = { status: '' };
      const errors = await validateDto(SetUserStatusRequest.Dto, dto);
      expect(errors.length).toBe(0);
    });
    it('should be successful result (status has 30 symbols)', async () => {
      const dto: SetUserStatusRequest.Dto = { status: '123456789012345678901234567890' };
      const errors = await validateDto(SetUserStatusRequest.Dto, dto);
      expect(errors.length).toBe(0);
    });
    it('should has errors (status is not strings)', async () => {
      const dto = { status: 1 } as unknown as SetUserStatusRequest.Dto;
      const errors = await validateDto(SetUserStatusRequest.Dto, dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
    });
    it('should be successful result (status has greater symbols than 30)', async () => {
      const dto: SetUserStatusRequest.Dto = { status: '1234567890123456789012345678901' };
      const errors = await validateDto(SetUserStatusRequest.Dto, dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints.isLength).toBe(ErrorMessages.ru.STRING_LENGTH_MUST_NOT_BE_GREATER_THAN_N.format(30));
    });
  });
});
