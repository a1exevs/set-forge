import { Reflector } from '@nestjs/core';

import { ResultCodes } from '@common/constants';
import { SKIP_ENVELOPE_KEY } from '@common/decorators';
import { CommonResponse } from '@common/dto';
import { ResponseInterceptor } from '@common/interceptors';
import { getMockCallHandler, getMockExecutionContextData } from '@test/unit/helpers';

describe('ResponseInterceptor', () => {
  const data = { result: 'result' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should wrap the data into the envelope', () => {
    expect.assertions(4);
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const { mockContext } = getMockExecutionContextData({});
    new ResponseInterceptor(reflector).intercept(mockContext, getMockCallHandler(data)).subscribe(response => {
      expect(response).toBeInstanceOf(CommonResponse.Dto);
      expect((response as CommonResponse.Dto).resultCode).toBe(ResultCodes.OK);
      expect((response as CommonResponse.Dto).fieldsErrors).toEqual([]);
      expect((response as CommonResponse.Dto).data).toEqual(data);
    });
  });

  it('should leave the data as is on a route marked with SkipEnvelope', () => {
    expect.assertions(2);
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const { mockContext } = getMockExecutionContextData({});
    new ResponseInterceptor(reflector).intercept(mockContext, getMockCallHandler(data)).subscribe(response => {
      expect(response).toEqual(data);
      expect(reflector.getAllAndOverride).toBeCalledWith(SKIP_ENVELOPE_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });
  });
});
