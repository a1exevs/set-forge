import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from '@auth/auth.module';
import { Role } from '@roles/roles.model';
import { RolesService } from '@roles/roles.service';

@Module({
  controllers: [],
  providers: [RolesService],
  imports: [SequelizeModule.forFeature([Role]), AuthModule],
  exports: [RolesService],
})
export class RolesModule {}
