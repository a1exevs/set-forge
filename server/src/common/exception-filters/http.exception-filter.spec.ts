import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';

import { HttpExceptionFilter } from '@common/exception-filters';
import { getMockArgumentsHostData } from '@test/unit/helpers';

describe('HttpExceptionFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('catch', () => {
    it('should catch exception', async () => {
      const { mockArgumentsHost, mockGetResponse, response } = getMockArgumentsHostData({});
      const errorCode = HttpStatus.BAD_REQUEST;
      const errorMessage = 'Error message';
      const httpExceptionFilter = new HttpExceptionFilter();
      httpExceptionFilter.catch(new HttpException(errorMessage, errorCode), mockArgumentsHost);
      const body = JSON.parse(response._getData());

      expect(response._getStatusCode()).toBe(errorCode);
      expect(mockGetResponse).toBeCalledTimes(1);
      expect(body.messages).toContainEqual(errorMessage);
      expect(body.data).toBeNull();
    });

    it('should respond when UnauthorizedException is caught', () => {
      const { mockArgumentsHost, mockGetResponse, response } = getMockArgumentsHostData({});
      const errorMessage = 'User is not authorized';
      const httpExceptionFilter = new HttpExceptionFilter();
      httpExceptionFilter.catch(new UnauthorizedException({ message: errorMessage }), mockArgumentsHost);
      const body = JSON.parse(response._getData());

      expect(response._getStatusCode()).toBe(HttpStatus.UNAUTHORIZED);
      expect(mockGetResponse).toBeCalledTimes(1);
      expect(body.messages).toContainEqual(errorMessage);
      expect(body.data).toBeNull();
    });
  });
});
