import { HttpStatus, Logger, NotFoundException } from '@nestjs/common';

import { ResultCodes } from '@common/constants';
import { HttpExceptionFilter } from '@common/exception-filters';
import { AppException } from '@common/exceptions';
import { getMockArgumentsHostData } from '@test/unit/helpers';

describe('HttpExceptionFilter', () => {
  let logError: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logError = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logError.mockRestore();
  });

  it('should send an AppException in the envelope with its code', () => {
    const { mockArgumentsHost, response } = getMockArgumentsHostData({});
    new HttpExceptionFilter().catch(AppException.of(HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED'), mockArgumentsHost);
    const body = JSON.parse(response._getData());

    expect(response._getStatusCode()).toBe(HttpStatus.UNAUTHORIZED);
    expect(body.data).toBeNull();
    expect(body.resultCode).toBe(ResultCodes.ERROR);
    expect(body.messages).toEqual(['User is not authorized']);
    expect(body.fieldsErrors).toEqual([{ code: 'UNAUTHORIZED', params: {}, message: 'User is not authorized' }]);
    expect(logError).not.toBeCalled();
  });

  it('should send a Nest exception in the envelope with the code of its status', () => {
    const { mockArgumentsHost, response } = getMockArgumentsHostData({});
    new HttpExceptionFilter().catch(new NotFoundException(), mockArgumentsHost);
    const body = JSON.parse(response._getData());

    expect(response._getStatusCode()).toBe(HttpStatus.NOT_FOUND);
    expect(body.fieldsErrors[0].code).toBe('NOT_FOUND');
  });

  it('should send a crash as an internal error and log it', () => {
    const { mockArgumentsHost, response } = getMockArgumentsHostData({});
    new HttpExceptionFilter().catch(new Error('db is down'), mockArgumentsHost);
    const body = JSON.parse(response._getData());

    expect(response._getStatusCode()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body.messages).toEqual(['Internal server error']);
    expect(logError).toBeCalledWith(expect.stringContaining('db is down'));
  });

  it('should log the internal failure behind an error, never send it', () => {
    const { mockArgumentsHost, response } = getMockArgumentsHostData({});
    const exception = AppException.of(HttpStatus.BAD_REQUEST, 'FAILED_TO_CREATE_USER', {}, new Error('duplicate'));
    new HttpExceptionFilter().catch(exception, mockArgumentsHost);

    expect(response._getData()).not.toContain('duplicate');
    expect(logError).toBeCalledWith(expect.stringContaining('duplicate'));
  });

  it('should send nothing when the headers are already sent', () => {
    const { mockArgumentsHost, response } = getMockArgumentsHostData({});
    response.headersSent = true;
    new HttpExceptionFilter().catch(new NotFoundException(), mockArgumentsHost);

    expect(response._getData()).toBe('');
  });
});
