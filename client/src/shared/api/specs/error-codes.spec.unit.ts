import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { rootDir } from 'tests/common/paths';

import { SERVER_ERROR_CODES } from '../api-error';

// The server's catalogue read as text: a code added there without its client text fails here, not in front of a user.
const serverCatalogue = readFileSync(resolve(rootDir, '../server/src/common/constants/error-messages.ts'), 'utf8');
const serverCodes = [...serverCatalogue.matchAll(/^ {2}([A-Z_]+):/gm)].map((match: RegExpMatchArray) => match[1]);

describe('error codes', () => {
  it('mirror the codes of the server catalogue', () => {
    expect(serverCodes.length).toBeGreaterThan(0);
    expect([...SERVER_ERROR_CODES].sort()).toEqual([...serverCodes].sort());
  });
});
