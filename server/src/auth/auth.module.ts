import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthController } from '@auth/auth.controller';
import { AuthService } from '@auth/auth.service';
import { UsersModule } from '@users/users.module';
import { RefreshTokensService } from '@auth/refresh-tokens.service';
import { TokensService } from '@auth/tokens.service';
import { RefreshToken } from '@auth/refresh-tokens.model';
import { User } from '@users/users.model';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RefreshTokensService, TokensService],
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY || 'SECRET',
      signOptions: {
        expiresIn: '600s',
      },
    }),
    SequelizeModule.forFeature([RefreshToken, User]),
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
