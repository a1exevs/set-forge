export type LoginInput = { email: string; password: string; captcha?: string; redirectTo?: string };

export type RegisterInput = {
  email: string;
  password: string;
  consent: boolean;
  termsAccepted: boolean;
  redirectTo?: string;
};
