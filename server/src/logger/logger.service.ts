import { ConsoleLogger, Injectable } from '@nestjs/common';

import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class LoggerService extends ConsoleLogger {
  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);
    LoggerService.logToFile(message, stack, context);
  }

  static logToFile(message: any, stack?: string, context?: string, isLogAsync = true) {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const logDir = `${path.resolve(__dirname, './../../', process.env.SERVER_LOGS)}/${year}/${month}/`;
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    const data = `[YYYY/MM/DD HH:MM:SS][${year}/${month}/${day} ${date.toLocaleTimeString()}]\n[${message}]\n[${stack}]\n[${context}]\n\n`;
    if (isLogAsync) {
      fs.appendFile(`${logDir}${day}.ts`, data, 'utf-8', err => {
        if (err) {
          this.logToFile(message, stack, context, false);
        }
      });
    } else fs.appendFileSync(`${logDir}${day}.ts`, data, 'utf-8');
  }
}
