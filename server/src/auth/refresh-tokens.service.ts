import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';

import { RefreshToken } from '@auth/refresh-tokens.model';

/** session/signed-in-devices */
export const MAX_SIGNED_IN_DEVICES = 5;

@Injectable()
export class RefreshTokensService {
  /**
   * Stores the token for the user. The user's expired records go first; at the device limit the records that expire
   * soonest — every token lives the same time, so the ones refreshed least recently — make room for the new one.
   */
  public async createRefreshToken(userId: number, tokenHash: string, ttl: number): Promise<RefreshToken> {
    await RefreshToken.destroy({ where: { userId, expires: { [Op.lte]: new Date() } } });

    const active = await RefreshToken.findAll({ where: { userId }, order: [['expires', 'ASC']], attributes: ['uuid'] });
    const evicted = active.slice(0, Math.max(0, active.length - MAX_SIGNED_IN_DEVICES + 1));
    if (evicted.length > 0) {
      await RefreshToken.destroy({ where: { uuid: evicted.map(token => token.uuid) } });
    }

    const token = new RefreshToken();
    token.userId = userId;
    token.tokenHash = tokenHash;
    token.expires = new Date(Date.now() + ttl);

    return token.save();
  }

  public async findTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
    return RefreshToken.findOne({ where: { tokenHash } });
  }

  public async removeTokenByHash(tokenHash: string): Promise<number> {
    return RefreshToken.destroy({ where: { tokenHash } });
  }
}
