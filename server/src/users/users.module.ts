import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { User } from '@users/users.model';
import { UserRole } from '@users/users-roles.model';
import { UsersService } from '@users/users.service';
import { RolesModule } from '@roles/roles.module';
import { AuthModule } from '@auth/auth.module';

@Module({
  controllers: [],
  providers: [UsersService],
  imports: [SequelizeModule.forFeature([User, UserRole]), RolesModule, forwardRef(() => AuthModule)],
  exports: [UsersService],
})
export class UsersModule {}
