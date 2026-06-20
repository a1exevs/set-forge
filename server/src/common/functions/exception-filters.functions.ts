import { HttpException } from '@nestjs/common';
import { Response } from 'express';

import { CommonResponse } from '@common/dto';
import { ResultCodes } from '@common/constants';

export const sendResponse = (
  exception: HttpException,
  response: Response,
  resultCode: number = ResultCodes.ERROR,
  messages: string[] = [],
) => {
  const status = exception.getStatus();
  let messagesList = [];
  if (exception.message) {
    if (Array.isArray(exception.message)) {
      messagesList = [...exception.message];
    } else messagesList = [exception.message];
  }

  if (messages.length) {
    messagesList = messagesList.concat(messages);
  }

  response.status(status).json(
    new CommonResponse.Dto({
      messages: messagesList,
      resultCode,
    }),
  );
};
