import { Module } from '@nestjs/common';

import { FilesService } from '@files//files.service';
import { LoggerModule } from '@logger/logger.module';

@Module({
  providers: [FilesService],
  imports: [LoggerModule],
  exports: [FilesService],
})
export class FilesModule {}
