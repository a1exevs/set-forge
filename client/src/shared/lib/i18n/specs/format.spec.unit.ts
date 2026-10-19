import { formatDate } from '../format';

// Midday UTC: the same calendar day in every time zone the tests run in.
const OCT_19 = '2026-10-19T12:00:00.000Z';

describe('formatDate', () => {
  it('gives the day and the short month in the order and names of the language', () => {
    expect(formatDate(OCT_19, 'en')).toBe('Oct 19');
    expect(formatDate(OCT_19, 'ru')).toBe('19 окт.');
  });

  it('takes the options of the caller', () => {
    const withYear: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

    expect(formatDate(OCT_19, 'en', withYear)).toBe('Oct 19, 2026');
    expect(formatDate(OCT_19, 'ru', withYear)).toBe('19 окт. 2026 г.');
  });

  it('gives an empty label for an invalid date instead of throwing', () => {
    expect(formatDate('not a date', 'en')).toBe('');
  });
});
