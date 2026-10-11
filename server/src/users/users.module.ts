import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from '@auth/auth.module';
import { RolesModule } from '@roles/roles.module';
import { UserRole } from '@users/users-roles.model';
import { User } from '@users/users.model';
import { UsersService } from '@users/users.service';

@Module({
  controllers: [],
  providers: [UsersService],
  imports: [SequelizeModule.forFeature([User, UserRole]), RolesModule, forwardRef(() => AuthModule)],
  exports: [UsersService],
})
export class UsersModule {}
