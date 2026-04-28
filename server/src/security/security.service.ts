import { Injectable } from '@nestjs/common';

import { FilesService } from '@files/files.service';

import * as svgCaptcha from 'svg-captcha';

@Injectable()
export class SecurityService {
  constructor(private fileService: FilesService) {}

  public async getCaptchaURL(): Promise<{ captchaURL: string; captchaText: string }> {
    const captcha = svgCaptcha.create();
    const svgFile = { buffer: captcha.data };
    const { filePath, fileURL: captchaURL } = await this.fileService.createFile(svgFile, '', 'svg', 'security/captcha');
    this.fileService.deleteFileWithTimer(filePath, 10);
    return { captchaURL, captchaText: captcha.text };
  }
}
