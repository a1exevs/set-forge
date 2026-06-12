import { ResponseInterceptor } from '@common/interceptors';
import { getMockCallHandler, getMockExecutionContextData } from '@test/unit/helpers';
import { ResultCodes } from '@common/constants';

describe('ResponseInterceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ResponseInterceptor - intercept', () => {
    it('should be successful result', () => {
      expect.assertions(3);
      const data = { result: 'result' };
      const { mockContext } = getMockExecutionContextData({});
      const callHandler = getMockCallHandler(data);
      const interceptor = new ResponseInterceptor();
      interceptor.intercept(mockContext, callHandler).subscribe(response => {
        expect(response.resultCode).toBe(ResultCodes.OK);
        expect(response.fieldsErrors).toEqual([]);
        expect(response.data).toEqual(data);
      });
    });
  });
});
