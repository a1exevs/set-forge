---
description: Code comments — why, not what, in a line or two; the rule named by id; a lower layer never names its callers; no repeated constants; the comment-length lint
paths:
  - "client/**"
  - "server/**"
  - "scripts/**"
  - "packages/**"
  - "eslint.config.ts"
  - "lint-staged.config.cjs"
---

# Code Comments

A comment holds what the code cannot say, in a line or two. The explanation behind it has one owner — a domain doc
or a rule — and the comment names that owner instead of retelling it, so the two never drift apart.

## What a comment says

- **Why, not what.** The code says what it does; a comment gives the reason: a constraint from outside, a trap, a
  choice that looks wrong and is not.
- **The rule by its name.** A business rule is named by its invariant id (`session/bootstrap-once`), a convention by
  its rule (`fsd-architecture §4`) — never retold. A comment that needs more is an explanation, and it goes to that
  doc or rule ([domain-docs](domain-docs.md), [agent-docs](agent-docs.md)).
- **No repeated constants.** A comment never states a value held by a constant or a config; it names the constant
  if it needs to.

## Keep to the layer

A comment of a lower layer describes its own contract and never names who uses it or how — it stays true when the
caller changes: "the caller decides when to leave", not "the button shows the progress".

- Client: `shared` → entities → features → widgets → pages ([fsd-architecture](fsd-architecture.md) §1), and data →
  logic → presentation inside a component ([component-architecture](component-architecture.md)).
- Server: model → service → controller; DTOs belong to the controller's contract.

## Length

| Comment | At most |
|---|---|
| A run of `//` lines on adjacent lines, each on a line of its own (an empty `//` counts) | 2 lines |
| A `/* */` block | 2 lines |
| A `/** */` doc comment | 3 lines of description — blank lines, tag lines (`@invariant`, `@remarks`, any `@tag`) and the body of `@example` not counted |

Exempt: the header of a file (the comments before its first code — but a `/** */` right above a first statement
that is not an `import` documents that statement and is counted), lint and compiler directives (`eslint-*`, `@ts-*`, `/// <reference>`, coverage and bundler
pragmas). Comments in Markdown, YAML, JSON and SCSS are outside the lint.

## Related

- [domain-docs](domain-docs.md) — where a business rule and its reason live.
- [agent-docs](agent-docs.md) — where a convention lives; one source per fact.

## Enforcement

| Rule | Checked by |
|---|---|
| The length limits; the header and directives exempt | `npm run client:lint` · `npm run server:lint` · `npm run lint:root` · ESLint `set-forge/comment-length` · `packages/eslint-config/src/comment-length-rule.ts` |
| The lint counts as this rule says | `npm run eslint-config:test` · `packages/eslint-config/src/specs/comment-length-rule.spec.ts` |
| Why, not what; the rule named by id, not retold | ❌ review |
| Keep to the layer | ❌ review |
| No repeated constants | ❌ review |
