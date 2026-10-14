---
description: Agent skills — what a skill adds on top of agent-docs: decisions owned by its stage, verified and gated outward actions, its frontmatter
paths:
  - ".claude/skills/**"
---

# Agent Skills

`.claude/skills/<name>/SKILL.md` are the repository workflows; everything of [agent-docs](agent-docs.md) applies.
The owners among them: `/branches` — the branch model, base, gate and task folder; `/analyst` — the task model,
statuses and issue format; `/pr` — the PR description and what runs before a PR.

## Decisions by stage

A skill decides only what its stage owns and never asks the user for another stage's decision: `/analyst` — what
and why (scope, acceptance, the split into sub-issues by acceptance); `/developer` — how (design, the cut into
parts, their order, what runs in parallel). A decision found at the wrong stage is handed over with a link
(`/analyst #N` for a requirement), not taken.

## Outward actions

- Every outward action goes through a gate of its owner skill — an issue write: `/analyst` §3–§4; a branch operation
  or a push, with its card move: `/branches` §4–§5; a PR write, with its card move: `/pr` steps 6–7 — and a new
  action names its gate line.
- A skill fits the infrastructure: a change of CI, hooks or settings that a skill would need is a separate decision
  for the user, proposed with its trade-off, never folded into the skill edit.

## Shape

- Frontmatter: `name`, `description` (what it does, then `Use when …` with the phrases that trigger it),
  `argument-hint` when it takes arguments. Numbered sections or steps, so links read `§N`.
- A new skill → its name in the skills list of `CLAUDE.md`.

## Related

- [agent-docs](agent-docs.md) — one source per fact, links, terms, verified commands.

## Enforcement

| Rule | Checked by |
|---|---|
| Decisions only of the skill's own stage | ❌ review |
| Every outward action gated; no infrastructure change folded in | ❌ review |
| Frontmatter, numbered sections, the `CLAUDE.md` skills list | ❌ review |
