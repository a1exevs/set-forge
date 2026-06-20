import { createResponse } from 'node-mocks-http';
import { HttpException, HttpStatus } from '@nestjs/common';

import { sendResponse } from '@common/functions';
import { ResultCodes } from '@common/constants';

describe('ExceptionFiltersHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ExceptionFiltersFunctions - sendResponse', () => {
    it('should be successful result', () => {
      const errorMessage = 'errorMessage';
      const errorCode = HttpStatus.BAD_REQUEST;
      const response = createResponse();
      const exception = new HttpException(errorMessage, errorCode);
      const resultCode = 1;
      const messages = ['messages1', 'messages2'];
      sendResponse(exception, response, resultCode, messages);
      const body = JSON.parse(response._getData());
      const status = response._getStatusCode();

      expect(status).toBe(errorCode);
      expect(body.resultCode).toBe(resultCode);
      expect(body.data).toBeNull();
      expect(body.messages).toEqual([errorMessage, ...messages]);
    });
    it('should be successful result (with default parameters)', () => {
      const errorMessage = 'errorMessage';
      const errorCode = HttpStatus.BAD_REQUEST;
      const response = createResponse();
      const exception = new HttpException(errorMessage, errorCode);
      sendResponse(exception, response);
      const body = JSON.parse(response._getData());
      const status = response._getStatusCode();

      expect(status).toBe(errorCode);
      expect(body.resultCode).toBe(ResultCodes.ERROR);
      expect(body.data).toBeNull();
      expect(body.messages).toEqual([errorMessage]);
    });
  });
});
