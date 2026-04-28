import { existsSync, readFileSync, rmdirSync } from 'fs';
import * as path from 'path';
import { HttpException } from '@nestjs/common';

export const TEST_FILE_PATH = path.resolve(__dirname, './../../../', 'assets/sowa.jpg');
export const TEST_FILE_ORIGINAL_NAME = 'sowa.jpg';

interface IFile {
  buffer: Buffer;
  size: number;
  mimetype: string;
  originalname: string;
}

export const loadTestFile = (
  filePath: string,
  mockSizeInBytes: number,
  mockMimeType: string,
  mockOriginalName,
): IFile => {
  let buffer;
  filePath.split('/');
  try {
    buffer = readFileSync(filePath);
  } catch (error) {
    throw new HttpException(error.message, error.status);
  }
  return { buffer, mimetype: mockMimeType, size: mockSizeInBytes, originalname: mockOriginalName };
};

export const removeTestStaticDir = () => {
  removeTestDir(process.env.SERVER_STATIC);
};

const removeTestDir = (dir: string) => {
  if (existsSync(dir)) {
    try {
      rmdirSync(dir, { recursive: true });
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
};

export const removeTestLogsDir = () => {
  removeTestDir(process.env.SERVER_LOGS);
};
