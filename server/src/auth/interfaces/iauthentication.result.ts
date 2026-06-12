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
  };
}
