import { checkForApiProperties } from '@test/unit/helpers';
import { GetCurrentUserResponse } from '@auth/dto';

describe('GetCurrentUserResponse', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should has ApiProperty decorator for all properties', () => {
    const dto = new GetCurrentUserResponse.Dto({ id: 1, email: 'email', documentsPendingAcceptance: false });
    checkForApiProperties(dto, GetCurrentUserResponse.Dto);
  });
});
