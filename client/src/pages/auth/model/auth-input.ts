export type LoginInput = { email: string; password: string; captcha?: { id: string; answer: string } };

export type RegisterInput = {
  email: string;
  password: string;
  consent: boolean;
  termsAccepted: boolean;
};
