import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { HttpExceptionFilter } from '@common/exception-filters';
import { ResponseInterceptor } from '@common/interceptors';
import { ValidationPipe } from '@common/pipes';
import { LoggerService } from '@src/logger';

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

export async function configureApp(app: INestApplication): Promise<void> {
  const clientUrl = process.env.CLIENT_URL || undefined;

  setupLogger(app);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser());
  app.setGlobalPrefix('api/1.0');
  setupCORS(app, [clientUrl]);
}
