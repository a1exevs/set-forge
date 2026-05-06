import { emailToAvatarLetter } from 'src/entities/session/model/avatar-letter';

describe('emailToAvatarLetter', () => {
  it('returns uppercase first letter of local part', () => {
    expect(emailToAvatarLetter('jane@example.com')).toBe('J');
  });

  it('handles missing @ using full string', () => {
    expect(emailToAvatarLetter('localonly')).toBe('L');
  });

  it('returns question mark for empty local part', () => {
    expect(emailToAvatarLetter('@example.com')).toBe('?');
  });
});
