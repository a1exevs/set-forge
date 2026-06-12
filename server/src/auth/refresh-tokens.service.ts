import { Injectable } from '@nestjs/common';

import { User } from '@users/users.model';
import { RefreshToken } from '@auth/refresh-tokens.model';

@Injectable()
export class RefreshTokensService {
  public async createRefreshToken(user: User, ttl: number): Promise<RefreshToken> {
    const maxLoginsCount = 5;

    const token = new RefreshToken();

    const loginsCount: number = await RefreshToken.count({ where: { userId: user.id } });

    if (loginsCount >= maxLoginsCount) {
      await this.removeAllTokensByUserId(user.id);
    }

    token.userId = user.id;
    token.isRevoked = false;
    const expiration = new Date();
    expiration.setTime(expiration.getTime() + ttl);

    token.expires = expiration;

    return token.save();
  }

  public async findTokenByUUId(uuid: number): Promise<RefreshToken | null> {
    return RefreshToken.findOne({ where: { uuid } });
  }

  public async removeTokenByUUId(uuid: number): Promise<number> {
    return RefreshToken.destroy({ where: { uuid } });
  }

  private async removeAllTokensByUserId(userId: number): Promise<number> {
    return RefreshToken.destroy({ where: { userId } });
  }
}
