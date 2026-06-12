import { INestApplication } from '@nestjs/common';

import { ValidationPipe } from '@common/pipes';
import { LoggerService } from '@src/logger';
import { SequelizeSessionStore } from '@src/security/sequelize-session.store';

import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { Sequelize } from 'sequelize';

function setupCORS(app: INestApplication, whiteList: string[]) {
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || whiteList.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, Authorization',
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

export async function configureApp(app: INestApplication): Promise<void> {
  const clientUrl = process.env.CLIENT_URL || undefined;

  setupLogger(app);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.setGlobalPrefix('api/1.0');
  setupCORS(app, [clientUrl]);
  await setupSession(app);
}
