---
name: branches
description: The repository's branch model (main ← testing ← develop, <type>/<name> work branches, shared branches and their <name>--<n> sub-branches, the release branches), the branch type ↔ PR label table, how to find the base of a branch, and the approval gate for every branch operation. Use before creating, switching, renaming, deleting, pushing, resetting, rebasing or merging a branch, when a skill needs the branch / base / label rules (/commit, /pr, /release), or when the user runs /branches.
---

# branches

The single source of the branch rules: `/commit`, `/pr` and `/release` refer here instead of repeating them.

## 1. Branch model

```
main  ←  testing  ←  develop  ←  <type>/<name>
                             ←  <type>/<name>  ←  <type>/<name>--1, <type>/<name>--2, …
```

| Branch | Role | Changes only through |
|---|---|---|
| `main` | production; every GitHub Release `vX.X.X` is tagged on it | `/release` PR `testing` → `main` |
| `testing` | pre-release check; branched from `main` | `/release` PR `develop` → `testing` |
| `develop` | integration; branched from `testing`; the default base of all work | merged PRs |
| `<type>/<name>` | one task: a feature, a fix, a doc change; branched from `develop`, PR into `develop` | commits of the task; for a shared branch, merged PRs of its sub-branches |
| `<type>/<name>--<n>` | one part of a long task (a sub-branch); branched from `<type>/<name>`, PR into it | commits of the part |

- `main`, `testing` and `develop` are **protected**: never commit on them, never push to them, never open a PR from
  them — except the promotion PRs of `/release`.
- A work branch starts from the latest `origin/develop` and goes back into `develop` by a PR (`/pr`).
- A long task becomes a **shared branch** `<type>/<name>` (`feature/new-ui-component`) with numbered
  **sub-branches** `<type>/<name>--<n>` (`feature/new-ui-component--1`, `--2`, …): each starts from the latest
  `origin/<type>/<name>` and goes back into it by a PR; the shared branch goes into `develop` when the task is done.
  One level only — a sub-branch has no sub-branches. Others build on a shared branch, so never force-push, rebase
  or reset it.
- Release branches (created only inside `/release`, PR into `develop`):
  - `common/version-increase` — the version bump; `update-version` rewrites it on every release (`/release`
    Phase A), so never commit anything else on it.
  - `common/release-notes-update-vX.X.X` — the `RELEASE-NOTES.md` entry of a published release, from
    `origin/develop`.

## 2. Types and labels

A work branch is `<type>/<name>`: `<type>` from the table, `<name>` short kebab-case by purpose
(`bugfix/workout-list-menu-click-navigation`, `common/setup-skill`). A sub-branch appends `--<n>`, a number from 1
(`feature/new-ui-component--1`), and keeps the type of its shared branch. The type is also the commit prefix
(`[Common] …`, see `/commit`) and the PR label (see `/pr`). On a sub-branch its number follows the type in every
commit and PR title: `common/some-changes--1` → `[Common][1] …`.

| Label | Used for | Description in the repo |
|---|---|---|
| `feature` | work branch `feature/*` | New functionality |
| `bugfix` | work branch `bugfix/*` | Fix of some bugs |
| `improvement` | work branch `improvement/*` | Improvement of existing functionality |
| `refactoring` | work branch `refactoring/*` | Code refactoring |
| `common` | work branch `common/*`, both release branches | Dependencies update, some libraries configuration, version increase etc |
| `documentation` | work branch `documentation/*` | Improvements or additions to documentation |
| `storybook` | work branch `storybook/*` | Stories for components |
| `tests` | work branch `tests/*` | Unit tests, e2e-tests, mock data etc |
| `testing` | PR `develop` → `testing` only | PR from 'develop' to 'testing' |
| `release` | PR `testing` → `main` only | PR before release of new app version |

`testing` and `release` are never branch prefixes. The labels live in the repository (`gh label list`); a new type
means a new label there, a new row here and the type in the `argument-hint` of `/commit` (frontmatter cannot link).

## 3. The base of a branch

The name gives the base:

- `<type>/<name>--<n>` → `<type>/<name>` (`feature/new-ui-component--2` → `feature/new-ui-component`). It must exist
  on `origin` (`git ls-remote --heads origin <type>/<name>`); if it does not, stop and ask.
- any other work branch → `develop`.

The branch already has a PR with another base (`gh pr view --json baseRefName -q .baseRefName`) → show both and ask.

The base is what `/pr` targets (`--base`) and what `/code-review <base>` compares against.

## 4. The gate

Every operation that creates, moves or removes a branch, or rewrites what it points to, waits for the user's
explicit yes **for that operation**:

- create (`git checkout -b`, `git switch -c`, `git branch <name>`), switch (`checkout` / `switch`), rename, delete
  (local or remote);
- `git push` of any kind (first push, `--force-with-lease`), setting or changing an upstream;
- `reset`, `rebase`, `merge` / `pull` into a branch, `cherry-pick`;
- `git stash` / `stash pop` done to switch branches.

How:

1. Say what you will run and why, in one line each: `git switch --no-track -c common/branches-skill origin/develop
   — a branch for the branches skill`. Propose the branch name and the base; the user may change either.
2. Wait for the answer. Silence, "ok to the plan" or an approval of an earlier operation is not a yes for this one.
3. The user naming the operation is the yes ("stash it and go to develop" approves exactly that stash and that
   switch — not the branch that comes next).

Without the gate: reading (`git status`, `branch`, `log`, `diff`, `show`, `rev-parse`, `ls-remote`), `git fetch`,
and commits on the current non-protected branch through `/commit` (it asks for its own approval).

## 5. Doing it safely

- **Dirty tree before a switch:** stop and ask — commit (`/commit`) or stash (`git stash push -u -m "<what>"`, so
  untracked files go too). Never discard changes, never `checkout -- .` / `reset --hard` someone's work.
- **New work branch:** `git fetch origin <base>`, then `git switch --no-track -c <branch> origin/<base>` with the
  base from §3:
  - `git switch --no-track -c feature/new-ui-component origin/develop`
  - `git switch --no-track -c feature/new-ui-component--1 origin/feature/new-ui-component`

  `--no-track` goes **before** `-c` (`-c` takes the next word as the branch name). Without it the branch tracks
  `origin/<base>`, and a bare `git push` would push the work into the base.
- **First push:** `git push -u origin <branch>` — the upstream is the branch itself.
- **Wrong branch for a change** (on a protected branch, or the type does not match): say so and propose the branch;
  don't create it on your own.
- **Coming back:** after a detour (stash → another branch → back), restore with `git stash pop` on the original
  branch and check `git status` — each of those steps is gated too.
