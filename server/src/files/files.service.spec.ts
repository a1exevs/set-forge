import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { existsSync } from 'fs';

import { COMPRESS_IMAGE_NAME_PREFIX, FilesService } from '@files/files.service';
import {
  sendPseudoError,
  loadTestFile,
  removeTestStaticDir,
  TEST_FILE_ORIGINAL_NAME,
  TEST_FILE_PATH,
} from '@test/unit/helpers';
import { ErrorMessages } from '@common/constants';
import { LoggerService } from '@logger/logger.service';

describe('FilesService', () => {
  let filesService: FilesService;
  let logger: LoggerService;
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: LoggerService,
          useValue: {
            error: jest.fn(x => x),
          },
        },
      ],
    }).compile();

    filesService = module.get<FilesService>(FilesService);
    logger = module.get<LoggerService>(LoggerService);
  });

  afterEach(async () => {
    removeTestStaticDir();
  });

  describe('FilesService - definition', () => {
    it('FilesService - should be defined', () => {
      expect(filesService).toBeDefined();
    });
    it('LoggerService - should be defined', () => {
      expect(logger).toBeDefined();
    });
  });

  describe('FilesService - addJPEGFile', () => {
    it('should be successful result', async () => {
      expect.assertions(10);
      const file = loadTestFile(TEST_FILE_PATH, 20000000, 'image/jpeg', TEST_FILE_ORIGINAL_NAME);
      const fileName = 'testImageFileName';
      const fileDir = 'fileDir';
      const { originalImageURL, originalImagePath, smallImageURL, smallImagePath } = await filesService.addJPEGFile(
        file,
        fileName,
        fileDir,
      );
      const url = process.env.SERVER_URL + ':' + process.env.PORT + '/';
      const originalImagePathDividedArr = originalImagePath.split('/');
      const originalImageUrlDividedArr = originalImageURL.split('/');
      const smallImagePathDividedArr = smallImagePath.split('/');
      const smallImageUrlDividedArr = smallImageURL.split('/');
      expect(existsSync(originalImagePath)).toBe(true);
      expect(existsSync(smallImagePath)).toBe(true);
      expect(originalImageURL.includes(url)).toBe(true);
      expect(originalImagePathDividedArr).toContainEqual(fileName + '.' + 'jpg');
      expect(smallImageURL.includes(url)).toBe(true);
      expect(smallImagePathDividedArr).toContainEqual(COMPRESS_IMAGE_NAME_PREFIX + fileName + '.' + 'jpg');
      expect(originalImagePathDividedArr[originalImagePathDividedArr.length - 2]).toBe(fileDir);
      expect(smallImagePathDividedArr[smallImagePathDividedArr.length - 2]).toBe(fileDir);
      expect(originalImageUrlDividedArr[originalImageUrlDividedArr.length - 2]).toBe(fileDir);
      expect(smallImageUrlDividedArr[smallImageUrlDividedArr.length - 2]).toBe(fileDir);
    });
    it('should be successful result (with original file name)', async () => {
      expect.assertions(6);
      const originalName = TEST_FILE_ORIGINAL_NAME;
      const file = loadTestFile(TEST_FILE_PATH, 20000000, 'image/jpeg', originalName);
      const { originalImageURL, originalImagePath, smallImageURL, smallImagePath } = await filesService.addJPEGFile(
        file,
      );
      const originalImagePathDividedArr = originalImagePath.split('/');
      const originalImageUrlDividedArr = originalImageURL.split('/');
      const smallImagePathDividedArr = smallImagePath.split('/');
      const smallImageUrlDividedArr = smallImageURL.split('/');
      expect(existsSync(originalImagePath)).toBe(true);
      expect(existsSync(smallImagePath)).toBe(true);
      expect(originalImagePathDividedArr[originalImagePathDividedArr.length - 1].includes(originalName)).toBeTruthy();
      expect(originalImageUrlDividedArr[originalImageUrlDividedArr.length - 1].includes(originalName)).toBeTruthy();
      expect(smallImagePathDividedArr[smallImagePathDividedArr.length - 1].includes(originalName)).toBeTruthy();
      expect(smallImageUrlDividedArr[smallImageUrlDividedArr.length - 1].includes(originalName)).toBeTruthy();
    });
    it('should be throw exception (file was not selected', async () => {
      const file = null;
      try {
        await filesService.addJPEGFile(file, 'test', 'file');
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe(ErrorMessages.ru.FILE_NOT_SELECTED);
      }
    });
    it('should be throw exception (file has incorrect mime type', async () => {
      const file = loadTestFile(TEST_FILE_PATH, 20000000, 'image/png', TEST_FILE_ORIGINAL_NAME);
      try {
        await filesService.addJPEGFile(file, 'test', 'file');
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe(ErrorMessages.ru.FILE_UPLOAD_ERROR);
      }
    });
    it('should be throw exception (file has very large size (more then 50 MBytes)', async () => {
      const file = loadTestFile(TEST_FILE_PATH, 50000001, 'image/jpeg', TEST_FILE_ORIGINAL_NAME);
      try {
        await filesService.addJPEGFile(file, 'test', 'file');
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('FilesService - createFile', () => {
    it('should be successful result', async () => {
      expect.assertions(5);
      const file = loadTestFile(TEST_FILE_PATH, 20000000, 'image/jpeg', TEST_FILE_ORIGINAL_NAME);
      const fileName = 'testImageFileName';
      const fileExtension = 'jpg';
      const fileDir = 'fileDir';
      const url = process.env.SERVER_URL + ':' + process.env.PORT + '/';
      const { filePath, fileURL } = await filesService.createFile(file, fileName, fileExtension, fileDir);
      const filePathDividedArr = filePath.split('/');
      const fileURLDividedArr = fileURL.split('/');
      expect(existsSync(filePath)).toBe(true);
      expect(fileURL.includes(url)).toBe(true);
      expect(filePathDividedArr).toContainEqual(fileName + '.' + fileExtension);
      expect(filePathDividedArr[filePathDividedArr.length - 2]).toBe(fileDir);
      expect(fileURLDividedArr[fileURLDividedArr.length - 2]).toBe(fileDir);
    });
    it('should be successful result (with default parameters)', async () => {
      expect.assertions(5);
      const file = loadTestFile(TEST_FILE_PATH, 20000000, 'image/jpeg', TEST_FILE_ORIGINAL_NAME);
      const url = process.env.SERVER_URL + ':' + process.env.PORT + '/';
      const { filePath, fileURL } = await filesService.createFile(file);
      const filePathDividedArr = filePath.split('/');
      const fileURLDividedArr = fileURL.split('/');
      expect(existsSync(filePath)).toBe(true);
      expect(fileURL.includes(url)).toBe(true);
      expect(filePathDividedArr).toContainEqual(process.env.SERVER_STATIC);
      expect(filePathDividedArr[filePathDividedArr.length - 1].endsWith('.sowa')).toBeTruthy();
      expect(fileURLDividedArr[fileURLDividedArr.length - 1].endsWith('.sowa')).toBeTruthy();
    });
  });

  describe('FilesService - deleteFileWithTimer', () => {
    it('should delete file after N seconds', async () => {
      jest.useFakeTimers();
      expect.assertions(1);
      const file = loadTestFile(TEST_FILE_PATH, 20000000, 'image/jpeg', TEST_FILE_ORIGINAL_NAME);
      const { filePath } = await filesService.createFile(file);
      const seconds = 1;
      filesService.deleteFileWithTimer(filePath, seconds);
      setTimeout(() => {
        expect(existsSync(filePath)).toBeFalsy();
      }, (seconds + 4) * 1000);
      jest.runOnlyPendingTimers();
    });
    it('should exist a file after N/2 seconds', async () => {
      jest.useFakeTimers();
      expect.assertions(1);
      const file = loadTestFile(TEST_FILE_PATH, 20000000, 'image/jpeg', TEST_FILE_ORIGINAL_NAME);
      const { filePath } = await filesService.createFile(file);
      const seconds = 5;
      filesService.deleteFileWithTimer(filePath, seconds);
      setTimeout(() => {
        expect(existsSync(filePath)).toBeTruthy();
      }, (seconds / 2) * 1000);
      jest.runOnlyPendingTimers();
    });
  });
});
