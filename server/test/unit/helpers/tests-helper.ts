import { HttpException } from '@nestjs/common';

export const sendPseudoError = () => {
  throw new HttpException("Don't throw", 0);
};
