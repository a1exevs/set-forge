import { ErrorItemResponse } from '@common/dto';
import { checkForApiProperties } from '@test/unit/helpers';

describe('ErrorItemResponse', () => {
  it('should has ApiProperty decorator for all properties', () => {
    const dto = new ErrorItemResponse.Dto('NUMERIC_MUST_NOT_BE_LESS_THAN_N', { min: 1 }, 'exercises.0.sets');
    checkForApiProperties(dto, ErrorItemResponse.Dto);
  });

  it('should build the message from the catalogue with the params', () => {
    const dto = new ErrorItemResponse.Dto('STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N', {
      min: 8,
      max: 50,
    });
    expect(dto.message).toBe('Length must be greater than 8 and less than 50 characters');
    expect(dto).not.toHaveProperty('field');
  });

  it('should keep a given message', () => {
    const dto = new ErrorItemResponse.Dto('NOT_FOUND', {}, undefined, 'Cannot GET /api/1.0/nowhere');
    expect(dto.message).toBe('Cannot GET /api/1.0/nowhere');
    expect(dto.params).toEqual({});
  });
});
