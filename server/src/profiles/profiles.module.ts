import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ProfilesController } from '@profiles/profiles.controller';
import { ProfilesService } from '@profiles/profiles.service';
import { UserCommonInfo } from '@profiles/user-common-info.model';
import { AuthModule } from '@auth/auth.module';
import { UserContact } from '@profiles/user-contacts.model';
import { UsersModule } from '@users/users.module';
import { UserAvatar } from '@profiles/user-avatars.model';
import { UserCommonInfoService } from '@profiles/user-common-Info.service';
import { UserAvatarsService } from '@profiles/user-avatars.service';
import { UserContactsService } from '@profiles/user-contacts.service';
import { FilesModule } from '@files/files.module';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, UserCommonInfoService, UserContactsService, UserAvatarsService],
  imports: [
    SequelizeModule.forFeature([UserCommonInfo, UserContact, UserAvatar]),
    AuthModule,
    forwardRef(() => UsersModule),
    FilesModule,
  ],
  exports: [ProfilesService],
})
export class ProfilesModule {}
