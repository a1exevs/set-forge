import { formatMessage } from '@common/utils';

describe('formatMessage', () => {
  it('should fill the named placeholders', () => {
    expect(formatMessage('Length must be greater than {min} and less than {max}', { min: 8, max: 50 })).toBe(
      'Length must be greater than 8 and less than 50',
    );
  });

  it('should fill a placeholder used twice', () => {
    expect(formatMessage('{n} of {n}', { n: 3 })).toBe('3 of 3');
  });

  it('should keep a placeholder without its param', () => {
    expect(formatMessage('Must be one of: {values}')).toBe('Must be one of: {values}');
  });
});
