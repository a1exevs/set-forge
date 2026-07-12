import { validateDto } from '@test/unit/helpers';

import { GetWorkoutHistoryQuery } from '@workout-sessions/dto/get-workout-history.query';

describe('GetWorkoutHistoryQuery.Dto', () => {
  it('accepts valid limit and offset', async () => {
    const errors = await validateDto(GetWorkoutHistoryQuery.Dto, { limit: 20, offset: 0 });
    expect(errors).toHaveLength(0);
  });

  it('accepts omitted limit and offset', async () => {
    const errors = await validateDto(GetWorkoutHistoryQuery.Dto, {});
    expect(errors).toHaveLength(0);
  });

  it('rejects limit below 1', async () => {
    const errors = await validateDto(GetWorkoutHistoryQuery.Dto, { limit: 0 });
    expect(errors.some(error => error.property === 'limit')).toBe(true);
  });

  it('rejects limit above 50', async () => {
    const errors = await validateDto(GetWorkoutHistoryQuery.Dto, { limit: 51 });
    expect(errors.some(error => error.property === 'limit')).toBe(true);
  });

  it('rejects a non-integer limit', async () => {
    const errors = await validateDto(GetWorkoutHistoryQuery.Dto, { limit: 1.5 });
    expect(errors.some(error => error.property === 'limit')).toBe(true);
  });

  it('rejects a negative offset', async () => {
    const errors = await validateDto(GetWorkoutHistoryQuery.Dto, { offset: -1 });
    expect(errors.some(error => error.property === 'offset')).toBe(true);
  });

  it('rejects a non-integer offset', async () => {
    const errors = await validateDto(GetWorkoutHistoryQuery.Dto, { offset: 1.5 });
    expect(errors.some(error => error.property === 'offset')).toBe(true);
  });
});
