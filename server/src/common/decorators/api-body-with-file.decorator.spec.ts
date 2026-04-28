import { ApiBodyWithFile } from '@common/decorators';

const FILE_FIELD_NAME = 'file';

class TestBody {}

class TestClass {
  @ApiBodyWithFile({ body: TestBody, fileFieldName: FILE_FIELD_NAME })
  public testFunction() {
    return 'test';
  }
}

describe('ApiBodyWithFile', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should set metadata with apiExtraModels, apiConsumes, apiBody decorators keys', () => {
    const testClass = new TestClass();
    testClass.testFunction();
    const models = Reflect.getMetadata('swagger/apiExtraModels', TestClass.prototype.testFunction);
    const body = Reflect.getMetadata('swagger/apiParameters', TestClass.prototype.testFunction);
    const consumes = Reflect.getMetadata('swagger/apiConsumes', TestClass.prototype.testFunction);
    expect(models).toEqual([TestBody]);
    expect(body?.[0]?.schema?.properties?.[FILE_FIELD_NAME]).toBeDefined();
    expect(consumes?.[0]).toBe('multipart/form-data');
  });
});
