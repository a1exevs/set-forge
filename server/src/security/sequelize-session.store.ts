import * as session from 'express-session';
import { DataTypes, Sequelize } from 'sequelize';

type SessionData = session.SessionData;
type SessionCallback<T = SessionData | null> = (err?: unknown, sessionData?: T) => void;

type SessionAttributes = {
  sid: string;
  data: string;
  expiresAt: Date;
};

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

// TODO: expired sessions are only removed lazily on access (see `get`). Rows whose sid is never
// requested again (e.g. after the client gets a new session cookie) accumulate in the `sessions`
// table indefinitely. Add a periodic reaper (`DELETE FROM sessions WHERE expiresAt <= NOW()` on an
// unref'd interval or a cron) when volume warrants it.
export class SequelizeSessionStore extends session.Store {
  private readonly sequelize: Sequelize;
  private readonly SessionModel: ReturnType<Sequelize['define']>;
  private readonly ttlMs: number;

  constructor(sequelize: Sequelize, ttlMs = DEFAULT_TTL_MS) {
    super();

    this.sequelize = sequelize;
    this.ttlMs = ttlMs;
    this.SessionModel = this.sequelize.define(
      'Session',
      {
        sid: {
          type: DataTypes.STRING(255),
          primaryKey: true,
          allowNull: false,
        },
        data: {
          type: DataTypes.TEXT('long'),
          allowNull: false,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        tableName: 'sessions',
        timestamps: true,
      },
    );
  }

  async sync() {
    await this.SessionModel.sync();
  }

  override get(sid: string, callback: SessionCallback) {
    this.SessionModel.findByPk(sid)
      .then(record => {
        if (!record) {
          callback(undefined, null);
          return;
        }

        const expiresAt = new Date(record.get('expiresAt') as string | Date);
        if (expiresAt.getTime() <= Date.now()) {
          this.destroy(sid, () => undefined);
          callback(undefined, null);
          return;
        }

        const parsed = JSON.parse(record.get('data') as string) as SessionData;
        callback(undefined, parsed);
      })
      .catch(error => callback(error));
  }

  override set(sid: string, userSession: SessionData, callback?: (err?: unknown) => void) {
    const expiresAt = this.resolveExpiresAt(userSession);
    const payload: SessionAttributes = {
      sid,
      data: JSON.stringify(userSession),
      expiresAt,
    };

    this.SessionModel.upsert(payload)
      .then(() => callback?.())
      .catch(error => callback?.(error));
  }

  override destroy(sid: string, callback?: (err?: unknown) => void) {
    this.SessionModel.destroy({
      where: { sid },
    })
      .then(() => callback?.())
      .catch(error => callback?.(error));
  }

  override touch(sid: string, userSession: SessionData, callback?: (err?: unknown) => void) {
    const expiresAt = this.resolveExpiresAt(userSession);

    this.SessionModel.update(
      {
        expiresAt,
      },
      {
        where: { sid },
      },
    )
      .then(() => callback?.())
      .catch(error => callback?.(error));
  }

  private resolveExpiresAt(userSession: SessionData) {
    const explicitExpires = userSession.cookie?.expires;
    if (explicitExpires) {
      return new Date(explicitExpires);
    }

    return new Date(Date.now() + this.ttlMs);
  }
}
