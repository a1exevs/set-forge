import { validateDto } from '@test/unit/helpers';
import { CreateRoleRequest } from '@roles/dto/create-role.request';
import { ErrorMessages } from '@common/constants';

describe('CreateRoleRequest', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should be successful result', async () => {
      const dto = new CreateRoleRequest.Dto('admin', 'Admin role');
      const errors = await validateDto(CreateRoleRequest.Dto, dto);
      expect(errors.length).toBe(0);
    });
    it('should has errors (values are not strings)', async () => {
      const dto = new CreateRoleRequest.Dto(1, 2);
      const errors = await validateDto(CreateRoleRequest.Dto, dto);
      expect(errors[0].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
      expect(errors[0].property).toBe('value');
      expect(errors[1].constraints.isString).toBe(ErrorMessages.ru.MUST_BE_A_STRING);
      expect(errors[1].property).toBe('description');
    });
  });
});
