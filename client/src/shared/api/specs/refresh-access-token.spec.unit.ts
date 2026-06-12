import { clearAccessToken, getAccessToken } from 'src/shared/api/access-token.store';
import { refreshAccessToken } from 'src/shared/api/refresh-access-token';

const jsonOk = {
  data: { userId: 1, accessToken: 'new-token' },
  messages: [],
  fieldsErrors: [],
  resultCode: 0,
};

const mockResponse = (
  ok: boolean,
  status: number,
  body: unknown,
): Partial<Response> & { json: () => Promise<unknown> } => ({
  ok,
  status,
  json: async () => body,
});

describe('refreshAccessToken', () => {
  beforeEach((): void => {
    clearAccessToken();
    jest.resetAllMocks();
  });

  it('concurrent callers share a single fetch', async () => {
    let calls = 0;
    global.fetch = jest.fn(async () => {
      calls += 1;
      await new Promise(r => setTimeout(r, 10));
      return mockResponse(true, 201, jsonOk) as Response;
    });

    const a = refreshAccessToken();
    const b = refreshAccessToken();
    const [ra, rb] = await Promise.all([a, b]);

    expect(ra).toBe(true);
    expect(rb).toBe(true);
    expect(calls).toBe(1);
    expect(getAccessToken()).toBe('new-token');
  });

  it('returns false when response is not ok', async () => {
    global.fetch = jest.fn(async () => mockResponse(false, 401, {}) as Response);

    const ok = await refreshAccessToken();
    expect(ok).toBe(false);
    expect(getAccessToken()).toBeNull();
  });
});
