import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  public readonly message: any;

  constructor(response) {
    super(response, HttpStatus.BAD_REQUEST);
    this.message = response;
  }
}
