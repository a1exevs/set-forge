import { Module } from '@nestjs/common';

import { SecurityController } from '@security/security.controller';
import { SecurityService } from '@security/security.service';

@Module({
  controllers: [SecurityController],
  providers: [SecurityService],
})
export class SecurityModule {}
