import { Test, TestingModule } from '@nestjs/testing';
import { existsSync, readFileSync } from 'fs';

import { LoggerService } from '@logger/logger.service';
import { removeTestLogsDir } from '@test/unit/helpers';

import * as path from 'path';
import * as fs from 'fs';

const getLogFilePath = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return path.resolve(__dirname, './../../', process.env.SERVER_LOGS) + `/${year}/${month}/${day}.ts`;
};

describe('Logger', () => {
  let logger: LoggerService;
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.restoreAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    logger = module.get<LoggerService>(LoggerService);
  });

  afterAll(() => {
    removeTestLogsDir();
  });

  describe('LoggerService - definition', () => {
    it('LoggerService - should be defined', () => {
      expect(logger).toBeDefined();
    });
  });

  describe('LoggerService - error', () => {
    it('should be successful result', () => {
      const error = 'test error';
      const stack = 'test stack';
      const context = 'test context';
      const spiedF = jest.spyOn(LoggerService, 'logToFile').mockImplementation(x => x);
      logger.error(error, stack, context);
      expect(spiedF).toBeCalledTimes(1);
      expect(spiedF).toBeCalledWith(error, stack, context);
    });
  });

  describe('LoggerService - logToFile', () => {
    it('should be successful result', () => {
      expect.assertions(5);
      const error = 'test error' + `${Math.round(Math.random())}`;
      const stack = 'test stack' + `${Math.random()}`;
      const context = 'test context' + `${Math.random()}`;
      LoggerService.logToFile(error, stack, context, false);
      const logFilePath = getLogFilePath();

      let logData: string;
      try {
        logData = readFileSync(logFilePath, { encoding: 'utf-8' });
        expect(existsSync(process.env.SERVER_LOGS)).toBeTruthy();
        expect(existsSync(logFilePath)).toBeTruthy();
        expect(logData.includes(error)).toBeTruthy();
        expect(logData.includes(stack)).toBeTruthy();
        expect(logData.includes(context)).toBeTruthy();
      } catch (error) {
        console.log(error);
      }
    });
    it('should call async method for append of file (by default)', () => {
      jest.mock('fs');
      jest.spyOn(fs, 'appendFile').mockImplementation(x => x);
      jest.spyOn(fs, 'appendFileSync').mockImplementation(x => x);
      jest.spyOn(fs, 'existsSync').mockImplementation(() => false);
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => '');
      const logFilePath = getLogFilePath();
      const logFileDir = logFilePath
        .split('/')
        .map((dir, index, array) => (index === array.length - 1 ? '' : dir))
        .join('/');
      LoggerService.logToFile('message', 'stack', 'context');
      expect(fs.existsSync).toBeCalledTimes(1);
      expect(fs.existsSync).toBeCalledWith(logFileDir);
      expect(fs.mkdirSync).toBeCalledTimes(1);
      expect(fs.mkdirSync).toBeCalledWith(logFileDir, { recursive: true });
      expect(fs.appendFile).toBeCalledTimes(1);
      expect(fs.appendFileSync).toBeCalledTimes(0);
    });
    it('should call sync method for append of file', () => {
      jest.mock('fs');
      jest.spyOn(fs, 'appendFile').mockImplementation(x => x);
      jest.spyOn(fs, 'appendFileSync').mockImplementation(x => x);
      jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => '');
      const logFilePath = getLogFilePath();
      const logFileDir = logFilePath
        .split('/')
        .map((dir, index, array) => (index === array.length - 1 ? '' : dir))
        .join('/');
      LoggerService.logToFile('message', 'stack', 'context', false);
      expect(fs.existsSync).toBeCalledTimes(1);
      expect(fs.existsSync).toBeCalledWith(logFileDir);
      expect(fs.mkdirSync).toBeCalledTimes(0);
      expect(fs.appendFile).toBeCalledTimes(0);
      expect(fs.appendFileSync).toBeCalledTimes(1);
    });
  });
});
