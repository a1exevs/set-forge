# Set Forge — Claude Code context

## Principles

- The code is the source of truth. Docs hold only what the code can't say — intent, business rules with their
  reasons, cross-slice flows — and point to the code for everything concrete.
- Rules in `.claude/rules/` are immutable conventions in the shape of [agent-docs](.claude/rules/agent-docs.md),
  checked by `npm run client:lint`.
- Skills in `.claude/skills/<name>/SKILL.md` are the repository workflows (`/setup`, `/analyst`, `/developer`,
  `/branches`, `/commit`, `/pr`, `/code-review`, `/privacy-audit`, `/release`); Claude also picks them up from a plain
  request ("write up this feature", "take #12 into work", "commit this", "make a release", "set up my machine").
  The stages of the pipeline are named by role (`/analyst`, `/developer`), the tools they use by action.
- Branch operations wait for the user's yes — `/branches` §4.
- Secrets (`.env*`, `secrets/`, `*.pem`, `*.key`) are denied to the agent in `.claude/settings.json`.
- No change logs or task plans in the repo: requirements live in GitHub issues on the Set-forge board (written by
  `/analyst`), plans and acceptance in the PR, history in git. Agent artifacts that must survive between runs live
  in the task folder (`/branches` §2); `.runtime/` is gitignored.

## Domain docs

`docs/domains/*.md`, one per business domain, in the format of [domain-docs](.claude/rules/domain-docs.md).

| Domain | Doc |
|--------|-----|
| Session and account (auth, consents, re-consent, account deletion) | [session](docs/domains/session.md) |
| Workout lists (templates, import / export) | [workout-list](docs/domains/workout-list.md) |
| Workout sessions (training, progress, history) | [workout-session](docs/domains/workout-session.md) |

## Rules

| Rule | Scope |
|------|-------|
| [server-api](.claude/rules/server-api.md) | NestJS API, DTO, Swagger |
| [domain-docs](.claude/rules/domain-docs.md) | `docs/domains/`, what domain docs hold and never duplicate |
| [component-architecture](.claude/rules/component-architecture.md) | Client data / logic / presentation layers |
| [fsd-architecture](.claude/rules/fsd-architecture.md) | FSD layers, slices, segments, imports |
| [state-management](.claude/rules/state-management.md) | React Query / Zustand |
| [file-naming](.claude/rules/file-naming.md) | kebab-case, names by purpose |
| [styling-guidelines](.claude/rules/styling-guidelines.md) | SCSS modules |
| [typescript-guidelines](.claude/rules/typescript-guidelines.md) | TypeScript |
| [component-typing](.claude/rules/component-typing.md) | FC / Props / JSX callbacks |
| [i18n](.claude/rules/i18n.md) | Interface language, dictionaries, the `t` prop, literal-text lint |
| [storybook](.claude/rules/storybook.md) | Stories next to components, titles by FSD layer, showcase, Chromatic |
| [personal-data-compliance](.claude/rules/personal-data-compliance.md) | User PD, privacy policy, terms, doc versioning |
| [agent-docs](.claude/rules/agent-docs.md) | Agent markdown: who owns what, one source, one term, the rule-file shape |
| [agent-skills](.claude/rules/agent-skills.md) | `.claude/skills/`: decisions by stage, gated actions, frontmatter |

## Adding new artifacts

- New slice, page, widget, server module or model → its domain doc's Map, see
  [domain-docs](.claude/rules/domain-docs.md).
- New domain → `docs/domains/<domain>.md` + a row in the Domain docs table.
- Changed business rule → its invariant and test, see [domain-docs](.claude/rules/domain-docs.md).
- New rule → `.claude/rules/<name>.md` + a row in the Rules table. New workflow → `.claude/skills/<name>/SKILL.md`
  ([agent-skills](.claude/rules/agent-skills.md)).
