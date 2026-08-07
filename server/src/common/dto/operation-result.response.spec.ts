import { OperationResultResponse } from '@common/dto';
import { checkForApiProperties } from '@test/unit/helpers';

describe('OperationResultResponse', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should has ApiProperty decorator for all properties', () => {
    const dto = new OperationResultResponse.Dto({ result: 'success' });
    checkForApiProperties(dto, OperationResultResponse.Dto);
  });
});
