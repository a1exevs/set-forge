---
name: release
description: Orchestrate the full release pipeline in phases (version bump, develop → testing → main, GitHub Release, RELEASE-NOTES.md). Use when the user asks to make a release or runs /release <patch|minor|major>.
argument-hint: "[patch|minor|major]"
---

# release

Act as a Release Automation Agent for this repository. Orchestrate the full release pipeline in **phases**. Never
skip ahead. After every phase that requires a manual merge (or human review), STOP and wait for the user to say
continue before starting the next phase.

## 1. Parameter

Accept one required parameter: `[bump]` (`$1`).
Available values: `patch`, `minor`, `major`.

If missing or invalid, STOP and ask for a valid bump type. Do not guess.

Usage: `/release patch` (or `minor` / `major`).

## 2. Global rules

1. This skill is the source of truth for the flow (README links here). Keep the PR titles and branches exactly as
   the phases below specify.
2. Branches, their roles and the PR labels come from `/branches` (§1, §2). This skill intentionally creates the
   promotion PRs between protected branches (`develop` → `testing` → `main`). Do **not** apply the `/pr` safety lock
   that forbids PRs from those branches.
3. Do **not** merge PRs yourself unless the user explicitly asks. After creating a PR, report the URL and wait.
4. Do **not** push to a protected branch (`/branches` §1) directly.
5. Do **not** include Selectel/deploy steps — out of scope.
6. Before any mutating git/`gh` action in a phase, briefly state what you will do and get approval for that phase
   (except when the user already said "continue" into a clearly defined next phase — then execute that phase, still
   confirming before publish/force-push style actions). Branch operations, the ones `update-version` runs included,
   go through the gate of `/branches` §4 — a "continue" into the next phase does not approve them.
7. Track and reuse `vX.X.X`; never invent a version. After the bump read it from `client/package.json`; when resuming
   with the version unknown, derive it from the latest version-increase PR / commit or from `client/package.json` on
   `origin/develop`.
8. Prefer `gh` for GitHub operations.
9. Every PR of the release gets the label of its branch in `/branches` §2 (the release branches, the two promotion
   PRs) via `gh pr create --label …`.
10. A PR of a phase that is already open — or merged — for this release is reused: report its URL instead of opening
    a duplicate; one without its label gets it via `gh pr edit --add-label …`.
11. At each STOP, print a short status block:

```
Release status
- version: vX.X.X
- completed: Phase A … / Phase B …
- waiting for: <what the user must do>
- say: "continue" (or describe what was done) to proceed to Phase …
```

## 3. Phase A — Version bump + PR into develop

Goal: bump version and open the version-increase PR.

1. Ensure working tree is clean. If not, STOP and ask the user to commit/stash (`/branches` §5).
2. Confirm bump type with the user if not already explicit in the skill's argument.
3. Run: `npm run update-version:<bump>`
   - This script checks out `common/version-increase` (`/branches` §1), resets to `origin/develop`, bumps, commits,
     and force-pushes with lease — branch operations, gated before it runs (§2 rule 6).
4. Read the new version from `client/package.json` → `vX.X.X`.
5. Create the version-increase PR:
   - head: `common/version-increase`
   - base: `develop`
   - title: `[Common] Version increase vX.X.X`
   - body: brief note that this is an automated version bump for release `vX.X.X`
6. **STOP.** Ask the user to review/merge that PR manually, then say `continue`.

## 4. Phase B — Promote develop → testing

Precondition: the version-increase PR is merged into `develop` (verify via `gh pr view` / `git fetch` + compare).
If not merged, STOP and say so.

1. `git fetch origin`
2. Create the promotion PR:
   - head: `develop`
   - base: `testing`
   - title: `[Testing] Release vX.X.X`
3. **STOP.** Wait for manual merge + `continue`.

## 5. Phase C — Promote testing → main

Precondition: the promotion PR of Phase B is merged into `testing`.

1. `git fetch origin`
2. Create the promotion PR:
   - head: `testing`
   - base: `main`
   - title: `Release vX.X.X`
3. **STOP.** Wait for manual merge + `continue`.

## 6. Phase D — GitHub Release (tag + notes)

Precondition: the promotion PR of Phase C is merged into `main`.

1. `git fetch origin`
2. Generate draft release notes (do not publish yet), e.g.:
   - `gh release create vX.X.X --target main --generate-notes --draft`
   - If the tag/release already exists as draft, edit/reuse it instead of duplicating.
3. Show the generated notes to the user. Remind them they may:
   - remove unnecessary notes
   - fix PR titles via PR editing if needed, then regenerate/edit notes
4. Ask approval to publish. On approval:
   - publish the release (e.g. `gh release edit vX.X.X --draft=false`, or create non-draft if still only a draft
     plan)
   - final release must be tagged `vX.X.X` and target `main` (published release on the mainline commit)
5. Fetch the final published notes text for Phase E (`gh release view vX.X.X --json body -q .body` or equivalent).
6. **STOP** only if publish failed or notes still need human edits; otherwise proceed to Phase E after confirming
   publish succeeded. If the user wants to tweak notes first, STOP until they say `continue` / `publish`.

## 7. Phase E — Update RELEASE-NOTES.md

Precondition: GitHub Release `vX.X.X` is published; you have the final notes body.

1. Ensure clean working tree (or stash only with user approval). Start from latest `origin/develop` (`/branches` §5,
   every step gated):
   - `git fetch origin`
   - create/switch the release-notes branch (`/branches` §1):
     `git switch --no-track -c common/release-notes-update-vX.X.X origin/develop`
2. Prepend a new top section to `RELEASE-NOTES.md` matching existing style, e.g.:

```markdown
# Release vX.X.X
## What's Changed
<notes from GitHub Release>

**Full Changelog**: <compare URL if present in generated notes>

```

   Keep formatting consistent with prior entries in the file. Do not rewrite older releases.
3. Commit: `[Common] RELEASE-NOTES.md update vX.X.X`
4. Push branch (first push, `/branches` §5, gated) and create PR:
   - head: `common/release-notes-update-vX.X.X`
   - base: `develop`
   - title: `[Common] RELEASE-NOTES.md update vX.X.X`
5. Report the PR URL. The release is **done** after this PR is created.

## 8. Resume

When the user says `continue`, `merged`, `done`, or similar — or resumes mid-release (e.g. "continue after the
version-increase PR merged"):

1. Re-check git + `gh` state.
2. Mark completed phases.
3. Run only the next pending phase. Ask only if the state is ambiguous.
4. Never re-run a successful bump.

## 9. Failure handling

- If `update-version` fails (dirty tree, push rejected, etc.), show the error and STOP; do not invent a workaround
  that skips the script.
- If tag `vX.X.X` already exists on a different commit, STOP and ask the user how to proceed.
