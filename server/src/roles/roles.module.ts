import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { RolesService } from '@roles/roles.service';
import { Role } from '@roles/roles.model';
import { AuthModule } from '@auth/auth.module';

@Module({
  controllers: [],
  providers: [RolesService],
  imports: [SequelizeModule.forFeature([Role]), AuthModule],
  exports: [RolesService],
})
export class RolesModule {}
