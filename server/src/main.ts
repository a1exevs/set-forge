import 'module-alias/register';

import '@root/string.extensions';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '@src/app.module';
import { ValidationPipe } from '@common/pipes';
import { LoggerService } from '@src/logger';

import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { Sequelize } from 'sequelize';

import { SequelizeSessionStore } from '@src/security/sequelize-session.store';
import { ensureAuthSecretsConfigured } from '@common/utils/ensure-auth-secrets';

async function start() {
  ensureAuthSecretsConfigured();

  const PORT = process.env.PORT || 5000;
  const CLIENT_URL = process.env.CLIENT_URL || undefined;

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  setupLogger(app);
  if (process.env.NODE_ENV !== 'production') {
    setupDocsModule(app);
  }

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.setGlobalPrefix('api/1.0');

  const whitelist = [CLIENT_URL];
  setupCORS(app, whitelist);

  await setupSession(app);

  // eslint-disable-next-line no-console
  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

function setupDocsModule(app: INestApplication) {
  const docConfig = new DocumentBuilder()
    .setTitle('SOWA-Server')
    .setDescription('This is an API for messengers SOWA')
    .setVersion('1.0.0')
    .addTag('SOWA')
    .build();
  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('/api/docs', app, document);
}

function setupCORS(app: INestApplication, whiteList: string[]) {
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || whiteList.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
    maxAge: 600,
  });
}

function setupLogger(app: INestApplication) {
  app.useLogger(app.get(LoggerService));
}

async function setupSession(app: INestApplication) {
  // TODO(refactor): use the NestJS SequelizeModule connection for SequelizeSessionStore instead of a second Sequelize pool (duplicate MYSQL_* config and connections).
  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    logging: false,
  });

  const ttlMs = Number(process.env.SESSION_TTL_MS || 24 * 60 * 60 * 1000);
  const sessionStore = new SequelizeSessionStore(sequelize, ttlMs);
  await sessionStore.sync();

  app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
    }),
  );
}

start().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
