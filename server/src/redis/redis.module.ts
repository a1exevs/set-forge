import { Global, Inject, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

const RECONNECT_DELAY_MAX_MS = 2_000;

// While Redis is unreachable a command fails at once instead of waiting in a queue, so its caller decides the answer.
function buildClient(config: ConfigService) {
  return createClient({
    socket: {
      host: config.get<string>('REDIS_HOST'),
      port: Number(config.get<string>('REDIS_PORT')),
      reconnectStrategy: (retries: number): number => Math.min(retries * 100, RECONNECT_DELAY_MAX_MS),
    },
    disableOfflineQueue: true,
  });
}

export type RedisClient = ReturnType<typeof buildClient>;

/** Opens the connection before the app serves anything. */
async function connectRedis(config: ConfigService): Promise<RedisClient> {
  const logger = new Logger('Redis');
  const client = buildClient(config);
  // A client without an `error` listener throws on a lost connection and takes the process down with it.
  client.on('error', (error: Error) => logger.error(error.message));
  await client.connect();
  return client;
}

@Global()
@Module({
  providers: [{ provide: REDIS_CLIENT, useFactory: connectRedis, inject: [ConfigService] }],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly client: RedisClient) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.close();
    }
  }
}
