import { ConsoleLogger, Injectable } from '@nestjs/common';
import { appendFile, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

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
    const logDir = `${resolve(__dirname, './../../', process.env.SERVER_LOGS)}/${year}/${month}/`;
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }

    const data = `[YYYY/MM/DD HH:MM:SS][${year}/${month}/${day} ${date.toLocaleTimeString()}]\n[${message}]\n[${stack}]\n[${context}]\n\n`;
    if (isLogAsync) {
      appendFile(`${logDir}${day}.ts`, data, 'utf-8', err => {
        if (err) {
          this.logToFile(message, stack, context, false);
        }
      });
    } else {
      appendFileSync(`${logDir}${day}.ts`, data, 'utf-8');
    }
  }
}
