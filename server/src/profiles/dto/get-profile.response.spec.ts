import { GetProfileResponse } from '@profiles/dto';
import { checkForApiProperties } from '@test/unit/helpers';

describe('GetProfileResponse', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should has ApiProperty decorator for all properties', () => {
    const dto = new GetProfileResponse.Dto(
      {
        fullName: 'fullName',
        aboutMe: 'aboutMe',
        lookingForAJob: true,
        lookingForAJobDescription: 'description',
      },
      null,
      null,
    );
    checkForApiProperties(dto, GetProfileResponse.Dto);
  });
});
