import { RuleTester } from 'eslint';
import { describe, it } from 'node:test';

import rule from '../comment-length-rule.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

const code = (...lines: string[]): string => lines.join('\n');

ruleTester.run('comment-length', rule, {
  valid: [
    code('const a = 1;', '// one', '// two', 'const b = 2;'),
    code('const a = 1;', '// one', '// two', '', '// three', '// four'),
    code('// header one', '// header two', '// header three', '/** header doc */', 'const a = 1;'),
    code('/**', ' * Header one.', ' * Two.', ' * Three.', ' * Four.', ' */', '', 'const a = 1;'),
    code('const a = 1;', '/* global b */', '// one', '// two'),
    {
      code: code('/**', ' * Header one.', ' * Two.', ' * Three.', ' * Four.', ' */', "import a from 'a';", 'a();'),
      languageOptions: { sourceType: 'module' },
    },
    code(
      'const a = 1;',
      '// eslint-disable-next-line no-console',
      '// @ts-expect-error a reason',
      '// one',
      '// two',
      'console.log(a);',
    ),
    code('const a = 1; // trailing', '// one', '// two'),
    code(
      'const a = 1;',
      '/**',
      ' * One.',
      ' * Two.',
      ' *',
      ' * Three.',
      ' * @invariant session/bootstrap-once',
      ' * @example',
      ' * const b = a;',
      ' * const c = b;',
      ' */',
      'export const d = a;',
    ),
    code('const a = 1;', '/* one', '   two */'),
  ],
  invalid: [
    {
      code: code('const a = 1;', '// one', '// two', '// three'),
      errors: [{ messageId: 'lineRun', data: { count: '3', max: '2' }, line: 2, endLine: 4 }],
    },
    {
      code: code('const a = 1;', '// exported for tests', '// two', '// three'),
      errors: [{ messageId: 'lineRun', data: { count: '3', max: '2' }, line: 2 }],
    },
    {
      code: code('/**', ' * One.', ' * Two.', ' * Three.', ' * Four.', ' */', 'export const a = 1;'),
      errors: [{ messageId: 'doc', data: { count: '4', max: '3' }, line: 1 }],
    },
    {
      code: code('const a = 1;', '// one', '//', '// three'),
      errors: [{ messageId: 'lineRun', data: { count: '3', max: '2' }, line: 2 }],
    },
    {
      code: code('const a = 1;', '/**', ' * One.', ' * Two.', ' * Three.', ' * Four.', ' * @invariant a/b', ' */'),
      errors: [{ messageId: 'doc', data: { count: '4', max: '3' }, line: 2 }],
    },
    {
      code: code('const a = 1;', '/* one', '   two', '   three */'),
      errors: [{ messageId: 'block', data: { count: '3', max: '2' }, line: 2 }],
    },
  ],
});
