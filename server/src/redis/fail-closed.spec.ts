import { HttpStatus } from '@nestjs/common';

import { AppException } from '@common/exceptions';
import { failClosed } from '@src/redis';

describe('failClosed', () => {
  it('should give the answer of the call', async () => {
    await expect(failClosed(async () => 'OK', 'SIGN_IN_TEMPORARILY_UNAVAILABLE')).resolves.toBe('OK');
  });

  it("should answer 503 with the caller's code when the call fails, keeping the failure as its cause", async () => {
    const failure = new Error('The client is closed');

    const answer = failClosed(async () => Promise.reject(failure), 'SIGN_IN_TEMPORARILY_UNAVAILABLE');

    await expect(answer).rejects.toBeInstanceOf(AppException);
    await expect(answer).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      errors: [expect.objectContaining({ code: 'SIGN_IN_TEMPORARILY_UNAVAILABLE' })],
      cause: failure,
    });
  });
});
