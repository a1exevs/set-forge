import { Request } from 'express';
import { createRequest, createResponse } from 'node-mocks-http';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

interface IGetMockRequest {
  sessionVariables?: Record<'key' | 'value', string>[];
  cookiesVariable?: Record<'key' | 'value', string>[];
  body?: any;
}

interface IGetMockExecutionContextData extends IGetMockRequest {
  req?: any;
}

type IGetMockArgumentsHost = IGetMockExecutionContextData;

export const getMockRequest = function (props: IGetMockRequest): Request {
  const request = createRequest();
  if (props.sessionVariables && props.sessionVariables.length)
    props.sessionVariables.forEach(variable => request._setSessionVariable(variable.key, variable.value));

  if (props.cookiesVariable && props.cookiesVariable.length)
    props.cookiesVariable.forEach(cookie => request._setCookiesVariable(cookie.key, cookie.value));

  if (props.body) request._setBody(props.body);

  return request;
};

export const getMockExecutionContextData = function (props: IGetMockExecutionContextData) {
  const { mockArgumentsHost, mockGetRequest, mockGetResponse, request, response } = getMockArgumentsHostData(props);
  const mockContext: ExecutionContext = {
    getClass: jest.fn(),
    getHandler: jest.fn(),
    ...mockArgumentsHost,
  };

  return {
    mockContext,
    mockGetRequest,
    mockGetResponse,
    request,
    response,
  };
};

export const getMockArgumentsHostData = function (props: IGetMockArgumentsHost) {
  const request = props.req ? props.req : getMockRequest(props);
  const response = createResponse();
  const mockGetResponse = jest.fn().mockImplementation(() => response);
  const mockGetRequest = jest.fn().mockImplementation(() => request);
  const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
    getResponse: mockGetResponse,
    getRequest: mockGetRequest,
  }));
  const mockArgumentsHost = {
    switchToHttp: mockHttpArgumentsHost,
    getArgByIndex: jest.fn(),
    getArgs: jest.fn(),
    getType: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  };
  return {
    mockArgumentsHost,
    mockGetRequest,
    mockGetResponse,
    request,
    response,
  };
};

export const getMockCallHandler = (data: any): CallHandler => {
  return {
    handle: () => {
      return new Observable<any>(subscriber => subscriber.next(data));
    },
  };
};
