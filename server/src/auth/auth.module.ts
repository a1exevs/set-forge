import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthController } from '@auth/auth.controller';
import { AuthService } from '@auth/auth.service';
import { RefreshToken } from '@auth/refresh-tokens.model';
import { RefreshTokensService } from '@auth/refresh-tokens.service';
import { TokensService } from '@auth/tokens.service';
import { JwtAuthGuard, RefreshTokenGuard } from '@common/guards';
import { User } from '@users/users.model';
import { UsersModule } from '@users/users.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RefreshTokensService, TokensService, JwtAuthGuard, RefreshTokenGuard],
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET_KEY');
        if (typeof secret !== 'string' || !secret.trim()) {
          throw new Error(
            'JWT_SECRET_KEY must be a non-empty string (e.g. in `.{NODE_ENV}.env` or the process environment).',
          );
        }
        return {
          secret: secret.trim(),
          signOptions: {
            expiresIn: '600s',
          },
        };
      },
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([RefreshToken, User]),
  ],
  exports: [AuthService, JwtModule, JwtAuthGuard, RefreshTokenGuard],
})
export class AuthModule {}
