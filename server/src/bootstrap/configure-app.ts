import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { API_PREFIX } from '@common/constants';
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

// Behind proxies the socket is the nearest proxy; trusting their number makes `request.ip` the client's own address
// (session/sign-in-rate-limit). None is trusted by default, so a client cannot claim an address of its own.
function setupTrustProxy(app: INestApplication): void {
  const hops = Number(process.env.TRUST_PROXY_HOPS);
  if (Number.isInteger(hops) && hops > 0) {
    app.getHttpAdapter().getInstance().set('trust proxy', hops);
  }
}

function setupLogger(app: INestApplication) {
  app.useLogger(app.get(LoggerService));
}

export async function configureApp(app: INestApplication): Promise<void> {
  const clientUrl = process.env.CLIENT_URL || undefined;

  setupLogger(app);
  setupTrustProxy(app);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser());
  app.setGlobalPrefix(API_PREFIX);
  setupCORS(app, [clientUrl]);
}
