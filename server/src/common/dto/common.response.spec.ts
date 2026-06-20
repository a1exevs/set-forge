import { checkForApiProperties } from '@test/unit/helpers';
import { CommonResponse } from '@common/dto';

describe('CommonResponse', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should has ApiProperty decorator for all properties', () => {
    const dto = new CommonResponse.Dto();
    checkForApiProperties(dto, CommonResponse.Dto);
  });
});
