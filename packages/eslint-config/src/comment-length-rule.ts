import type { Rule, SourceCode } from 'eslint';

type Comment = ReturnType<SourceCode['getAllComments']>[number];

type Located = {
  comment: Comment;
  end: number;
  firstLine: number;
  lastLine: number;
  column: number;
};

const MAX_LINE_COMMENT_LINES = 2;
const MAX_DOC_DESCRIPTION_LINES = 3;

// Directives read in any comment: `eslint-disable*` / `eslint-enable`, `@ts-*`, `/// <reference>`, coverage and
// bundler pragmas.
const DIRECTIVE =
  /^\s*(eslint-(disable|enable)|@ts-|\/\s*<reference\b|prettier-ignore|istanbul\s|c8\s|@vite-ignore|webpack[A-Z]|[#@]__PURE__)/;
// Directives ESLint reads in block comments only: `eslint`, `eslint-env`, `global(s)`, `exported`.
const BLOCK_DIRECTIVE = /^\s*(eslint(-env)?\s|globals?\s|exported\s)/;

const isDirective = (comment: Comment): boolean =>
  DIRECTIVE.test(comment.value) || (comment.type === 'Block' && BLOCK_DIRECTIVE.test(comment.value));

const locate = (comment: Comment): Located | null => {
  if (!comment.range || !comment.loc) {
    return null;
  }
  return {
    comment,
    end: comment.range[1],
    firstLine: comment.loc.start.line,
    lastLine: comment.loc.end.line,
    column: comment.loc.start.column,
  };
};

/** Lines of a block comment without the leading `*` of each line. */
const blockLines = (value: string): string[] => value.split(/\r?\n/).map(line => line.replace(/^\s*\*?/, '').trim());

/** Description lines of a doc comment: tag lines, the body of `@example` and blank lines are not counted. */
const docDescriptionLines = (value: string): number => {
  let count = 0;
  let inExample = false;
  for (const line of blockLines(value)) {
    if (line.startsWith('@')) {
      inExample = /^@example\b/.test(line);
    } else if (!inExample && line !== '') {
      count++;
    }
  }
  return count;
};

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Limit the length of line, block and doc comments (.claude/rules/code-comments.md)' },
    schema: [],
    messages: {
      lineRun:
        'A line comment run of {{count}} lines (max {{max}}): keep the why, name the rule it relies on and move the explanation to that rule or doc',
      block:
        'A block comment of {{count}} lines (max {{max}}): keep the why, name the rule it relies on and move the explanation to that rule or doc',
      doc: 'A doc comment with {{count}} lines of description (max {{max}}): keep the contract, move the explanation to the rule or doc it relies on',
    },
  },
  create(context): Rule.RuleListener {
    const { sourceCode } = context;
    const ownLine = (comment: Located): boolean =>
      (sourceCode.lines[comment.firstLine - 1] ?? '').slice(0, comment.column).trim() === '';
    const report = (first: Located, last: Located, messageId: string, count: number, max: number): void => {
      if (first.comment.loc && last.comment.loc) {
        context.report({
          loc: { start: first.comment.loc.start, end: last.comment.loc.end },
          messageId,
          data: { count: String(count), max: String(max) },
        });
      }
    };

    return {
      Program(): void {
        // A header — the comments before the first code of the file — is exempt; a doc comment right above a first
        // statement that is not an import documents that statement, not the file.
        const codeStart = sourceCode.ast.tokens[0]?.range[0] ?? Infinity;
        const firstStatement = sourceCode.ast.body[0];
        const documentedLine =
          firstStatement && firstStatement.type !== 'ImportDeclaration' ? firstStatement.loc?.start.line : undefined;
        const isHeader = (comment: Located): boolean =>
          comment.end <= codeStart &&
          !(
            comment.comment.type === 'Block' &&
            comment.comment.value.startsWith('*') &&
            comment.lastLine + 1 === documentedLine
          );
        let run: Located[] = [];
        const flush = (): void => {
          const first = run[0];
          const last = run.at(-1);
          if (first && last && run.length > MAX_LINE_COMMENT_LINES) {
            report(first, last, 'lineRun', run.length, MAX_LINE_COMMENT_LINES);
          }
          run = [];
        };

        for (const raw of sourceCode.getAllComments()) {
          const comment = locate(raw);
          if (!comment || isHeader(comment) || isDirective(raw)) {
            flush();
            continue;
          }
          if (raw.type === 'Line') {
            const previous = run.at(-1);
            if (!ownLine(comment) || (previous && comment.firstLine !== previous.lastLine + 1)) {
              flush();
            }
            if (ownLine(comment)) {
              run.push(comment);
            }
            continue;
          }
          flush();
          if (raw.value.startsWith('*')) {
            const count = docDescriptionLines(raw.value);
            if (count > MAX_DOC_DESCRIPTION_LINES) {
              report(comment, comment, 'doc', count, MAX_DOC_DESCRIPTION_LINES);
            }
          } else {
            const count = blockLines(raw.value).filter(line => line !== '').length;
            if (count > MAX_LINE_COMMENT_LINES) {
              report(comment, comment, 'block', count, MAX_LINE_COMMENT_LINES);
            }
          }
        }
        flush();
      },
    };
  },
};

export default rule;
