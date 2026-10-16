import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { createResponse } from 'node-mocks-http';

import { ErrorCode, ResultCodes } from '@common/constants';
import { ErrorItemResponse } from '@common/dto';
import { AppException } from '@common/exceptions';
import { sendErrorResponse, toErrorResult } from '@common/functions';

describe('sendErrorResponse', () => {
  it('should send the items in fieldsErrors and their texts in messages', () => {
    const response = createResponse();
    const errors = [
      new ErrorItemResponse.Dto('MUST_BE_A_STRING', {}, 'exercises.0.name'),
      new ErrorItemResponse.Dto('USER_ALREADY_EXISTS'),
    ];
    sendErrorResponse(response, { status: HttpStatus.BAD_REQUEST, errors });
    const body = JSON.parse(response._getData());

    expect(response._getStatusCode()).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      data: null,
      messages: ['exercises.0.name - Must be a string', 'User already exists'],
      fieldsErrors: [
        { code: 'MUST_BE_A_STRING', params: {}, field: 'exercises.0.name', message: 'Must be a string' },
        { code: 'USER_ALREADY_EXISTS', params: {}, message: 'User already exists' },
      ],
      resultCode: ResultCodes.ERROR,
    });
  });

  it('should send the given result code', () => {
    const response = createResponse();
    const errors = [new ErrorItemResponse.Dto('NEED_AUTHORIZATION_WITH_CAPTCHA')];
    sendErrorResponse(response, { status: HttpStatus.UNAUTHORIZED, errors }, ResultCodes.NEED_CAPTCHA_AUTHORIZATION);

    expect(JSON.parse(response._getData()).resultCode).toBe(ResultCodes.NEED_CAPTCHA_AUTHORIZATION);
  });
});

describe('toErrorResult', () => {
  it('should give the items of an AppException', () => {
    const exception = AppException.of(HttpStatus.CONFLICT, 'USER_ALREADY_EXISTS');
    expect(toErrorResult(exception)).toEqual({ status: HttpStatus.CONFLICT, errors: exception.errors });
  });

  it.each([
    [new BadRequestException(), HttpStatus.BAD_REQUEST, 'BAD_REQUEST'],
    [new UnauthorizedException(), HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED'],
    [new ForbiddenException(), HttpStatus.FORBIDDEN, 'FORBIDDEN'],
    [new NotFoundException(), HttpStatus.NOT_FOUND, 'NOT_FOUND'],
    [new PayloadTooLargeException(), HttpStatus.PAYLOAD_TOO_LARGE, 'PAYLOAD_TOO_LARGE'],
    [new UnprocessableEntityException(), HttpStatus.UNPROCESSABLE_ENTITY, 'UNPROCESSABLE_ENTITY'],
    [new ConflictException(), HttpStatus.CONFLICT, 'BAD_REQUEST'],
    [new ServiceUnavailableException(), HttpStatus.SERVICE_UNAVAILABLE, 'INTERNAL_ERROR'],
  ])('should code a Nest exception by its status (%#)', (exception: HttpException, status: number, code: ErrorCode) => {
    const result = toErrorResult(exception);
    expect(result.status).toBe(status);
    expect(result.errors).toEqual([new ErrorItemResponse.Dto(code, {}, undefined, exception.message)]);
  });

  it('should keep the text of a Nest exception', () => {
    const [error] = toErrorResult(new NotFoundException('Cannot GET /api/1.0/nowhere')).errors;
    expect(error?.message).toBe('Cannot GET /api/1.0/nowhere');
  });

  it('should make anything else an internal error without its text', () => {
    const result = toErrorResult(new Error('connect ECONNREFUSED 127.0.0.1:3306'));
    expect(result).toEqual({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      errors: [new ErrorItemResponse.Dto('INTERNAL_ERROR')],
    });
  });

  it('should code a client error of the Express middleware by its status', () => {
    const tooLarge = Object.assign(new Error('request entity too large'), {
      status: 413,
      expose: true,
      type: 'entity.too.large',
    });
    expect(toErrorResult(tooLarge)).toEqual({
      status: HttpStatus.PAYLOAD_TOO_LARGE,
      errors: [new ErrorItemResponse.Dto('PAYLOAD_TOO_LARGE', {}, undefined, 'request entity too large')],
    });
  });

  it('should keep the status but not the text of a client error that does not expose it', () => {
    const missingFile = Object.assign(new Error("ENOENT: no such file or directory, stat '/srv/static/index.html'"), {
      status: 404,
      expose: false,
    });
    expect(toErrorResult(missingFile)).toEqual({
      status: HttpStatus.NOT_FOUND,
      errors: [new ErrorItemResponse.Dto('NOT_FOUND')],
    });
  });

  it('should not trust a server-side status of a plain error', () => {
    const failure = Object.assign(new Error('connect ECONNREFUSED'), { status: 503 });
    expect(toErrorResult(failure).errors).toEqual([new ErrorItemResponse.Dto('INTERNAL_ERROR')]);
  });
});
