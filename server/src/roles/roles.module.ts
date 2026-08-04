import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Role } from '@roles/roles.model';
import { RolesService } from '@roles/roles.service';

@Module({
  controllers: [],
  providers: [RolesService],
  imports: [SequelizeModule.forFeature([Role])],
  exports: [RolesService],
})
export class RolesModule {}
