import { ApiResult } from '@common/decorators';

import { CommonResponse } from '@common/dto';

const STATUS = 5;
const DESCRIPTION = 'DESCRIPTION';

class TestType {}

class TestClass {
  @ApiResult({ status: STATUS, description: DESCRIPTION, type: TestType })
  public testFunction() {
    return 'test';
  }
}

describe('ApiResultDecorator', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should set metadata with apiExtraModels and apiResponse decorators keys', () => {
    const testClass = new TestClass();
    testClass.testFunction();
    const models = Reflect.getMetadata('swagger/apiExtraModels', TestClass.prototype.testFunction);
    const responseData = Reflect.getMetadata('swagger/apiResponse', TestClass.prototype.testFunction);
    expect(models).toEqual([CommonResponse.Swagger.CommonResponseDto, TestType]);
    expect(responseData[STATUS]).toBeDefined();
    expect(responseData[STATUS].description).toBe(DESCRIPTION);
  });
});
