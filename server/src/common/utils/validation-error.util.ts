import { ValidationOptions } from 'class-validator';

import { ErrorCode, ErrorMessages, ErrorParams } from '@common/constants/error-messages';
import { formatMessage } from '@common/utils/formatters.util';

/** What a class-validator decorator carries for `ValidationPipe`: its code and params in `context`. */
export type ValidationErrorContext = {
  code: ErrorCode;
  params: ErrorParams;
};

/** Options of a class-validator decorator: the English text and, in `context`, the code with its params. */
export function validationError(code: ErrorCode, params: ErrorParams = {}): ValidationOptions {
  const context: ValidationErrorContext = { code, params };
  return { message: formatMessage(ErrorMessages[code], params), context };
}

/** Whether a `ValidationError.contexts` entry is the one `validationError(...)` put there. */
export function isValidationErrorContext(value: unknown): value is ValidationErrorContext {
  if (typeof value !== 'object' || value === null || !('code' in value) || !('params' in value)) {
    return false;
  }
  return typeof value.code === 'string' && value.code in ErrorMessages && typeof value.params === 'object';
}
