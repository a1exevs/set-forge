import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { createClient } from 'redis';

import { REDIS_CLIENT, RedisModule } from '@src/redis';

jest.mock('redis', () => ({ createClient: jest.fn() }));

type FakeClient = { on: jest.Mock; connect: jest.Mock; close: jest.Mock; isOpen: boolean };

describe('RedisModule', () => {
  let client: FakeClient;

  beforeEach(() => {
    client = { on: jest.fn(), connect: jest.fn().mockResolvedValue(undefined), close: jest.fn(), isOpen: true };
    (createClient as jest.Mock).mockReturnValue(client);
  });

  async function compile(): Promise<{ get: <T>(token: unknown) => T; close: () => Promise<void> }> {
    const config = { get: (key: string): string => ({ REDIS_HOST: 'redis', REDIS_PORT: '6380' })[key] };
    const moduleRef = await Test.createTestingModule({ imports: [RedisModule] })
      .useMocker(token => (token === ConfigService ? config : undefined))
      .compile();
    return { get: token => moduleRef.get(token as never), close: () => moduleRef.close() };
  }

  it('should connect to the configured host before the app starts and fail a command at once when offline', async () => {
    const moduleRef = await compile();

    expect(moduleRef.get(REDIS_CLIENT)).toBe(client);
    expect(client.connect).toHaveBeenCalled();
    expect(client.on).toHaveBeenCalledWith('error', expect.any(Function));
    const [options] = (createClient as jest.Mock).mock.calls[0];
    expect(options.socket).toMatchObject({ host: 'redis', port: 6380 });
    expect(options.disableOfflineQueue).toBe(true);
  });

  it('should close the connection on shutdown', async () => {
    const moduleRef = await compile();
    await moduleRef.close();

    expect(client.close).toHaveBeenCalled();
  });
});
