import '@root/string.extensions';

import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ensureAuthSecretsConfigured } from '@common/utils/ensure-auth-secrets';
import { AppModule } from '@src/app.module';
import { configureApp } from '@src/bootstrap/configure-app';

async function start() {
  ensureAuthSecretsConfigured();

  const PORT = process.env.PORT || 5000;

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  if (process.env.NODE_ENV !== 'production') {
    setupDocsModule(app);
  }
  await configureApp(app);

  // eslint-disable-next-line no-console
  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

function setupDocsModule(app: INestApplication) {
  const docConfig = new DocumentBuilder()
    .setTitle('Set Forge API')
    .setDescription('This is an API for Set Forge project')
    .setVersion('1.0.0')
    .addTag('Set Forge')
    .build();
  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('/api/docs', app, document);
}

start().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
