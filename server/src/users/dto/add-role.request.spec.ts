import { validateDto } from '@test/unit/helpers';
import { AddRoleRequest } from '@users/dto/add-role.request';
import { ErrorMessages } from '@common/constants';

describe('AddRoleRequest', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should be successful result', async () => {
      const dto = new AddRoleRequest.Dto('admin', 1);
      const errors = await validateDto(AddRoleRequest.Dto, dto);
      expect(errors.length).toBe(0);
    });
    it('should has errors (values have incorrect types)', async () => {
      const dto = new AddRoleRequest.Dto(1, '1');
      const errors = await validateDto(AddRoleRequest.Dto, dto);
      expect(errors[0].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
      expect(errors[0].property).toBe('value');
      expect(errors[1].constraints.isNumber).toBe(ErrorMessages.ru.MUST_BE_A_NUMBER);
      expect(errors[1].property).toBe('userId');
    });
  });
});
