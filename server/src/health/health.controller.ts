import { Controller, Get } from '@nestjs/common';

import { Routes } from '@common/constants';
import { SkipEnvelope } from '@common/decorators';

@Controller(Routes.HEALTH)
export class HealthController {
  @SkipEnvelope()
  @Get()
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
