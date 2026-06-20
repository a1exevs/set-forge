import { AuthenticationResponse } from '@auth/dto';
import { checkForApiProperties } from '@test/unit/helpers';

describe('AuthenticationResponse', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should has ApiProperty decorator for all properties', () => {
    const userId = 1;
    const accessToken = 'token';
    const dto = new AuthenticationResponse.Dto({ userId, accessToken });
    checkForApiProperties(dto, AuthenticationResponse.Dto);
  });
});
