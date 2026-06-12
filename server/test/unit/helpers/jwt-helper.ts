import { JwtService } from '@nestjs/jwt';

interface IGetMockJWTServiceData {
  expiresIn: string;
  payload: string | object;
  subject?: string;
  jwtId?: string;
}

export const getMockJWTServiceData = function (props: IGetMockJWTServiceData) {
  const jwtService = new JwtService({
    secret: 'SECRET',
    signOptions: {
      expiresIn: props.expiresIn,
      subject: props.subject ?? '',
      jwtid: props.jwtId ?? '',
    },
  });
  const token = jwtService.sign(props.payload);
  return {
    token,
    jwtService,
  };
};
