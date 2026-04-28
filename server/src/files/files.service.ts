import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { ErrorMessages } from '@common/constants';

import * as path from 'path';
import * as fs from 'fs';
import * as uuid from 'uuid';
import * as sharp from 'sharp';
import { LoggerService } from '@logger/logger.service';

export const COMPRESS_IMAGE_NAME_PREFIX = 'small_';

@Injectable()
export class FilesService {
  constructor(private loggerService: LoggerService) {}

  public async addJPEGFile(
    file: any,
    fileName = '',
    relativeDir = '',
  ): Promise<{ originalImageURL: string; originalImagePath: string; smallImageURL: string; smallImagePath: string }> {
    FilesService.checkForFileSelection(file);
    FilesService.checkForMimeType(file, 'image/jpeg');
    FilesService.checkForSize(file, 50);
    relativeDir = FilesService.correctRelativePath(relativeDir);
    if (!fileName) {
      const date = new Date();
      fileName = String(date.getTime()) + file.originalname;
    }
    // TODO move this hard code dir in specific mehtod (example, addAvatar)
    const relativeStaticDir = `/activecontent/images/avatars${relativeDir}`;
    const { filePath, fileURL } = await this.createFile(file, fileName, 'jpg', relativeStaticDir);
    const result = await this.compressImage(filePath);
    return {
      originalImageURL: fileURL,
      originalImagePath: filePath,
      smallImageURL: result.fileURL,
      smallImagePath: result.filePath,
    };
  }

  public async createFile(
    file: any,
    fileName = '',
    fileExtension = 'sowa',
    relativeStaticDir = '',
  ): Promise<{ filePath: string; fileURL: string }> {
    try {
      relativeStaticDir = FilesService.correctRelativePath(relativeStaticDir);

      if (!fileName) {
        fileName = `${uuid.v4()}.${fileExtension}`;
      } else if (!fileName.endsWith(`.${fileExtension}`)) {
        fileName = `${fileName}.${fileExtension}`;
      }

      const dirForSaving = path.resolve(__dirname, '../../', process.env.SERVER_STATIC + relativeStaticDir);
      if (!fs.existsSync(dirForSaving)) {
        fs.mkdirSync(dirForSaving, { recursive: true });
      }
      fs.writeFileSync(path.join(dirForSaving, fileName), file.buffer);

      const filePath = `${dirForSaving}/${fileName}`;
      const fileURL = this.getStaticFileURLFromStaticFileFullPath(filePath);

      return { filePath, fileURL };
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  public deleteFileWithTimer(filePath: string, seconds: number) {
    setTimeout(() => {
      fs.unlink(filePath, err => {
        if (err) {
          this.loggerService.error(err.message, 'FilesServices', 'deleteFileWithTimer-method');
        }
      });
    }, seconds * 1000);
  }

  private static correctRelativePath(pathStr: string) {
    if (pathStr[0] !== '/') {
      pathStr = `/${pathStr}`;
    }
    if (pathStr[pathStr.length - 1] !== '/') {
      pathStr += '/';
    }
    return pathStr;
  }

  private static checkForMimeType(file: any, haystack: string) {
    if (file.mimetype !== haystack) {
      throw new HttpException(ErrorMessages.ru.FILE_UPLOAD_ERROR, HttpStatus.BAD_REQUEST);
    }
  }

  private static checkForSize(file: any, maxMBytes: number) {
    if (!file.size || file.size > maxMBytes * 1000000) {
      throw new HttpException(
        ErrorMessages.ru.UPLOAD_FILE_SIZE_CANNOT_EXCEED_N_MBT.format(maxMBytes),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private static checkForFileSelection(file: any) {
    if (!file) {
      throw new HttpException(ErrorMessages.ru.FILE_NOT_SELECTED, HttpStatus.BAD_REQUEST);
    }
  }

  private async compressImage(filePath: string): Promise<{ filePath: string; fileURL: string }> {
    const list = filePath.split('/');
    const fileName = list[list.length - 1];
    const fileDir = filePath.replace(fileName, '');
    const compressFileName = COMPRESS_IMAGE_NAME_PREFIX + fileName;
    const compressFilePath = fileDir + compressFileName;

    try {
      await sharp(filePath)
        .resize({
          height: 150,
        })
        .toFile(compressFilePath);
    } catch (error) {
      throw new HttpException(ErrorMessages.ru.IMAGE_FILE_COMPRESSING_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { filePath: compressFilePath, fileURL: this.getStaticFileURLFromStaticFileFullPath(compressFilePath) };
  }

  private getStaticFileURLFromStaticFileFullPath(fullFilePath: string) {
    const serverStaticDir = process.env.SERVER_STATIC || undefined;
    const PORT = process.env.PORT || undefined;
    const SERVER_URL = process.env.SERVER_URL || undefined;
    if (!serverStaticDir || !PORT || !SERVER_URL) {
      return '';
    }
    const list = fullFilePath.split(serverStaticDir);
    if (list.length !== 2) {
      return '';
    }
    return `${SERVER_URL}:${PORT}${list[1]}`;
  }
}
