import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '@src/app.module';
import { configureApp } from '@src/bootstrap/configure-app';

export async function createTestApp(): Promise<INestApplication> {
  process.env.NODE_ENV = 'e2e';

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication({ bufferLogs: true });
  await configureApp(app);
  await app.init();

  return app;
}
