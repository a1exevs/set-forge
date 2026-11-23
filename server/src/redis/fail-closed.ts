import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@common/constants';
import { AppException } from '@common/exceptions';

/**
 * Runs a call to Redis and turns its failure into 503 with the caller's code: what Redis guards is closed while Redis
 * does not answer, never left unguarded.
 */
export async function failClosed<T>(call: () => Promise<T>, code: ErrorCode): Promise<T> {
  try {
    return await call();
  } catch (cause) {
    throw AppException.of(HttpStatus.SERVICE_UNAVAILABLE, code, {}, cause as Error);
  }
}
