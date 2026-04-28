import { validateDto } from '@test/unit/helpers';
import { GetUsersQuery } from '@users/queries/get-users.query';

describe('GetUsersQuery', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should be successful result', async () => {
      const query = new GetUsersQuery.Params(1, 1);
      const errors = await validateDto(GetUsersQuery.Params, query);
      expect(errors.length).toBe(0);
    });
    it('should be successful result (max count value)', async () => {
      const query = new GetUsersQuery.Params(1, 100);
      const errors = await validateDto(GetUsersQuery.Params, query);
      expect(errors.length).toBe(0);
    });
    it('should has errors (incorrect values of page and count)', async () => {
      const query = new GetUsersQuery.Params(0, 101);
      const errors = await validateDto(GetUsersQuery.Params, query);
      expect(errors.length).toBe(2);
      expect(errors[0].constraints.min).toBeDefined();
      expect(errors[0].property).toBe('page');
      expect(errors[1].constraints.max).toBeDefined();
      expect(errors[1].property).toBe('count');
    });
    it('should has errors (values are not integers)', async () => {
      const query = new GetUsersQuery.Params('page', 'count');
      const errors = await validateDto(GetUsersQuery.Params, query);
      expect(errors.length).toBe(2);
      expect(errors[0].constraints.min).toBeDefined();
      expect(errors[0].property).toBe('page');
      expect(errors[1].constraints.max).toBeDefined();
      expect(errors[1].property).toBe('count');
    });
  });
});
