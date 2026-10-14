---
description: Agent docs (skills, rules, domain docs, CLAUDE.md) — what each kind owns, one source per fact, links instead of restating, one term per thing, the shape of a rule file
paths:
  - ".claude/rules/**"
  - ".claude/skills/**"
  - "docs/**"
  - "CLAUDE.md"
---

# Agent Docs

The markdown an agent reads as instructions — `CLAUDE.md`, `.claude/rules/`, `.claude/skills/`, `docs/domains/` — is
code for the agent: a fact stated twice drifts into two facts, and every extra line is context spent on every run.
The human docs (`README.md`, `client/README.md`, `server/README.md`, `DEPLOY-SELECTEL.md`, `RELEASE-NOTES.md`) are
outside this rule.

## Who owns what

| Kind | Owns | Never holds |
|---|---|---|
| `CLAUDE.md` | the principles and the index of the rest | a rule, a workflow step or a business rule — a link to its owner |
| `.claude/rules/*.md` | a convention for code or docs, with what checks it, and the checklist of what new code needs | a workflow, a business rule |
| `.claude/skills/*/SKILL.md` | a workflow: its steps, gates and artifacts ([agent-skills](agent-skills.md)) | a code convention, a business rule |
| `docs/domains/*.md` | a domain's terms, invariants and flows ([domain-docs](domain-docs.md)) | anything the code states |

## One source, links elsewhere

- A fact has one owner file and, inside it, one place; anywhere else it is a link — `` `/<skill>` §N ``, a rule or a
  doc by name — plus only what is new there.
- A table is not retold in prose next to it, a reason is given once, an example once.
- A term is defined once and used verbatim everywhere (`task`, not `ticket`; `sub-branch`, not `child branch`).
- Renaming or renumbering a section, a row or a term → grep every link and use of it across the files above.

## Content

- A command, a flag, a path or a script named in a doc exists and does what the doc says — run or open it before
  writing it down.
- An edit adds what its change needs and no more: no change history or plans (`CLAUDE.md` Principles), no "now" /
  "new" / "previously".
- English, prose lines up to 120 characters (tables, frontmatter and fenced code exempt).

## Rule files

A file in `.claude/rules/` has one shape: frontmatter `description` and `paths` (the globs that load the rule when a
matching file is read), `# Title`, topic sections, an optional `## Related`, and `## Enforcement` last — a
`| Rule | Checked by |` table whose every row names a real check or `❌ review`.

## Related

- [agent-skills](agent-skills.md) — what only a skill adds: decisions by stage, gates, its frontmatter.
- [domain-docs](domain-docs.md) — the sections of a domain doc and what it never holds.

## Enforcement

| Rule | Checked by |
|---|---|
| The shape of a rule; every Enforcement reference resolves | `npm run client:lint` · `client/scripts/check-rules.ts` |
| Every path in a domain doc exists | `npm run lint:root` · `scripts/check-domain-docs.ts` |
| Each fact in its owner kind, stated once; links instead of restating; one term per thing | ❌ review |
| Links (`§N`, rule and doc names) and named commands resolve | ❌ review |
| No history wording; English; prose lines up to 120 characters | ❌ review |
