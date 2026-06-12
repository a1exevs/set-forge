import { Controller, Get } from '@nestjs/common';
import { Routes } from '@common/constants';

@Controller(Routes.HEALTH)
export class HealthController {
  @Get()
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
