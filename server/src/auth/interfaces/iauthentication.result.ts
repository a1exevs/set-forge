import { DeviceTrust } from '@auth/trusted-devices.service';

export interface IAuthenticationResult {
  readonly status: string;
  readonly data: {
    readonly user: {
      readonly id: number;
    };
    readonly payload: {
      readonly type: string;
      readonly accessToken: string;
      readonly refreshToken: string;
      readonly refreshToken_expiration: Date;
    };
    /** The trust of the device the user signed in on; `null` when none could be stored. */
    readonly deviceTrust: DeviceTrust | null;
  };
}
