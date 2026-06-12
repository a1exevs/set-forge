import { AuthRoles, ROLES_KEY } from '@common/decorators';

const TEST_ROLE_1 = 'test-role1';
const TEST_ROLE_2 = 'test-role2';

class TestClass {
  @AuthRoles(TEST_ROLE_1, TEST_ROLE_2)
  public testFunction() {
    return true;
  }
}

describe('AuthRolesDecorator', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should set metadata values with ROLES_KEY', () => {
    const testClass = new TestClass();
    testClass.testFunction();
    const roles = Reflect.getMetadata(ROLES_KEY, TestClass.prototype.testFunction);
    expect(roles).toEqual([TEST_ROLE_1, TEST_ROLE_2]);
  });
});
