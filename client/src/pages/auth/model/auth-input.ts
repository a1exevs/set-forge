export type LoginInput = { email: string; password: string; captcha?: string };

export type RegisterInput = {
  email: string;
  password: string;
  consent: boolean;
  termsAccepted: boolean;
};
