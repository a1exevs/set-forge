import { apiRequest, ApiRequestError } from '../http-client';

jest.mock('../refresh-access-token', () => ({ refreshAccessToken: jest.fn(async () => false) }));
jest.mock('../session-expired', () => ({ notifySessionExpired: jest.fn() }));

const response = (status: number, body: string, contentType = 'application/json'): Response =>
  new Response(body, { status, headers: { 'content-type': contentType } });

const failureOf = async (request: Promise<unknown>): Promise<ApiRequestError> => {
  try {
    await request;
  } catch (error: unknown) {
    if (error instanceof ApiRequestError) {
      return error;
    }
    throw error;
  }
  throw new Error('the request did not fail');
};

describe('apiRequest', () => {
  afterEach((): void => {
    jest.restoreAllMocks();
  });

  it('gives the error items of an envelope', async () => {
    const envelope = {
      data: null,
      messages: ['Invalid email or password'],
      fieldsErrors: [{ code: 'INVALID_EMAIL_OR_PASSWORD', params: {}, message: 'Invalid email or password' }],
      resultCode: 1,
    };
    global.fetch = jest.fn(async () => response(401, JSON.stringify(envelope)));

    const error = await failureOf(apiRequest('/auth/login', { method: 'POST', body: {} }));

    expect(error.status).toBe(401);
    expect(error.errors).toEqual(envelope.fieldsErrors);
    expect(error.message).toBe('Invalid email or password');
  });

  it.each([
    ['a body that is not JSON', response(502, '<html>Bad Gateway</html>', 'text/html')],
    ['a broken JSON body', response(500, '{"data":')],
    ['JSON that is not the envelope', response(500, '{"statusCode":500,"message":"Internal server error"}')],
  ])('answers %s with UNEXPECTED_RESPONSE', async (_case: string, answer: Response) => {
    global.fetch = jest.fn(async () => answer);

    const error = await failureOf(apiRequest('/workout-lists'));

    expect(error.errors).toEqual([{ code: 'UNEXPECTED_RESPONSE', params: {}, message: `HTTP ${answer.status}` }]);
  });

  it('answers a network failure with NETWORK_ERROR and status 0', async () => {
    global.fetch = jest.fn(async () => {
      throw new TypeError('Failed to fetch');
    });

    const error = await failureOf(apiRequest('/workout-lists'));

    expect(error.status).toBe(0);
    expect(error.errors.map(item => item.code)).toEqual(['NETWORK_ERROR']);
  });

  it('lets a cancelled request stay a cancellation', async () => {
    const controller = new AbortController();
    const abort = new DOMException('The operation was aborted.', 'AbortError');
    global.fetch = jest.fn(async () => {
      controller.abort();
      throw abort;
    });

    await expect(apiRequest('/workout-lists', { signal: controller.signal })).rejects.toBe(abort);
  });
});
