import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { User } from '@users/users.model';
import { UsersService } from '@users/users.service';
import { RolesModule } from '@roles/roles.module';
import { AuthModule } from '@auth/auth.module';

@Module({
  controllers: [],
  providers: [UsersService],
  imports: [SequelizeModule.forFeature([User]), RolesModule, forwardRef(() => AuthModule)],
  exports: [UsersService],
})
export class UsersModule {}
