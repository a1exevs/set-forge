import { checkForApiProperties } from '@test/unit/helpers';
import { GetUserAvatarResponse } from '@profiles/dto';

describe('GetUserAvatarResponse', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should has ApiProperty decorator for all properties', () => {
    const dto = new GetUserAvatarResponse.Dto({ small: 'small', large: 'large' });
    checkForApiProperties(dto, GetUserAvatarResponse.Dto);
  });
});
