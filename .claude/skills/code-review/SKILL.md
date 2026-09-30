---
name: code-review
description: Senior-engineer review of a change set with every finding verified (reproduced or tested), ranked as blocker / important / nit, printed as one table and logged per branch in .runtime/code-review/ so that later rounds mark what got fixed and /pr can attach the result. Use when the user asks to review the current changes, the branch since its base, or a commit range, or runs /code-review [base | range].
argument-hint: "[<base> | <base>..<head>]"
---

# code-review

Act as a senior software engineer reviewing a change set. The output is **one ranked table of verified findings**
and a verdict, and the same findings are kept in a **per-branch review log** that survives between rounds. A short
table — or an empty one — is a good review, not a failed one: **"Ready to commit" is the expected outcome for
solid code.** Never add a finding to look thorough.

## 1. Scope

Optional argument `$1` picks what to review. Never modify tracked files or the index: no `git add`, no `git
stash`, no edits during the review. The only file the review writes is its own log under `.runtime/` (§5).

| `$1` | Review | Commands |
|---|---|---|
| empty | uncommitted work only | `git diff HEAD` + untracked files |
| `<base>` — a single ref that is an ancestor of `HEAD` (`develop`, `common/cursor-to-claude`, `HEAD~2`) | **everything since the base: the branch's commits and the uncommitted work together.** The usual way to review a branch before committing or pushing | `git diff <base>` (base vs the working tree) + untracked files |
| `<base>..<head>` / `<base>...<head>` | the committed range only — what is already pushed or what a PR contains; uncommitted work is ignored | `git diff <range>` |

Untracked files come from `git ls-files --others --exclude-standard`; read them whole — they are all new lines.

Resolving a single ref: `git merge-base --is-ancestor <ref> HEAD` succeeds and `<ref>` is not `HEAD` itself →
it is a base. Otherwise (`HEAD`, a commit off this branch, a typo) → stop and say the ref is not an ancestor of
`HEAD`; one commit is reviewed as `<hash>^..<hash>`. Never fall back to `git show <ref>` — for a branch name that
would review the base's last commit, i.e. someone else's change.

The working tree is **dirty** when `git status --porcelain` prints anything; record it in the scope (§5, §6) so a
log entry made before the commit is not mistaken for one made after it.

Review **only the changed lines**. Read surrounding code, tests, `.claude/rules/` and `docs/domains/` as much as
needed to judge them — that is context, not scope.

## 2. What to look for

1. Bugs: wrong results, crashes, unhandled edge cases, logic errors, races.
2. Security: leaked secrets, injection, auth or ownership bypass, unsafe file / shell handling.
3. Repository rules (`.claude/rules/*.md`) and architecture that the lint does not catch (the `❌ review` rows of
   each rule's Enforcement table).
4. Domain docs (`docs/domains/*.md`): a changed business rule needs its invariant and test updated in the same change.
   The invariants of a touched domain that end with `❌ review` have no test — check by hand that the change still
   holds them.
5. Tests: changed behavior without a changed test.
6. Readability, naming, DRY, simplification, performance that is measurable in this app.

## 3. Verify before you report

A finding is a claim about behavior; back it up **before** it enters the table.

- **Behavioral claim (a bug, a crash, a wrong value):** reproduce it. Run the code with the failing input —
  `node -e`, a bash snippet, a copy of the script in the scratchpad directory with fabricated input, an existing
  test with a new case — or write a test that fails. Record the command and what it printed. Work outside the
  repository or in a temp copy; never modify tracked files to reproduce.
- **Rule / docs / style claim:** point at the exact line of the diff and the rule or doc it breaks. No reproduction
  needed, but no hand-waving either.
- **Cannot reproduce** (needs a real Mac, a VDS, a GitHub token, production data)? It stays in the table only as
  🟠 at most, with `unverified: <what would prove it>` in the Proof column. Never a 🔴 without proof.
- A reproduction that **refutes** the suspicion drops the finding — do not keep it as a "consider".

## 4. Severity — exactly one of three

Decide with the two questions below, in order. When in doubt, go **down**, never up.

| | Question 1: what happens if this ships as is? | Question 2: what is the proof? |
|---|---|---|
| 🔴 **Blocker** | Something breaks for a real user or developer of this repo on a **realistic input or state**: wrong result, crash, data loss or corruption, a secret exposed, auth / ownership bypass, red build / lint / test, a business rule changed without its invariant and test. | A reproduction or a failing test — mandatory. |
| 🟠 **Important** | Nothing breaks today, but a trap is set: wrong behavior only on a **rare but plausible** input; a message or doc that leads a developer to a wrong action; a repo rule violated that the lint misses; changed behavior with no test; a measurable performance cost in this app; a bug that is real but could not be reproduced here. | Reproduction, or a line + the rule / doc, or `unverified: …`. |
| 🟡 **Nit** | Nobody notices: naming, wording, comments, formatting, a simpler equivalent, a preference between two variants that both work. | A line reference. |

Fences between the categories:

- If you cannot name the **concrete input or state** that triggers the failure, it is not a 🔴.
- If you cannot say **who is hurt and when**, it is a 🟡.
- "Might", "could", "in theory" without a reproduction is 🟠 at best; without a plausible input it is nothing.
- A 🔴 candidate you failed to reproduce is 🟠 with `unverified`, not 🔴 "to be safe".

## 5. Review log — `.runtime/code-review/<branch>.md`

One file per branch, outside git (`.runtime/` is in `.gitignore`), keeps every finding of every round with a stable
number and a status. `/pr` copies it into the PR description.

- Path: `.runtime/code-review/<slug>.md`, where `<slug>` is the current branch with `/` replaced by `--`
  (`common/setup-skill` → `common--setup-skill.md`). Compute it with `git rev-parse --abbrev-ref HEAD`.
- Create the directory and the file on the first round. On later rounds **read it first**: it tells you what was
  already found and what is still open.

Format (keep it exactly — `/pr` and later rounds parse it):

```markdown
# Code review — common/setup-skill

Rounds: 2 · last: 2026-09-29 14:05 · scope: develop (77b0a62, 7 files)

| # | Sev | Where | Problem | Proof | Fix | Status |
|---|-----|-------|---------|-------|-----|--------|
| 1 | 🔴 | scripts/setup-env.sh:112 | `grep -q healthy` also matches `unhealthy` … | `echo unhealthy \| grep -q healthy` → exit 0 | `grep -qx healthy` | fixed (r2) |
| 2 | 🟠 | .claude/skills/setup/SKILL.md:88 | `nvm` is a shell function … | unverified: needs a Mac with brew nvm | source `nvm.sh` first | open (r1) |
| 3 | 🟡 | README.md:41 | "the first and the third" relies on list order | — | name the files | wontfix |

## Rounds

- r1 · 2026-09-29 13:40 · develop (7d707f0+dirty, 7 files) · 🔴 1 🟠 1 🟡 1 · Not ready
- r2 · 2026-09-29 14:05 · develop (77b0a62, 7 files) · fixed 1 · new 0 · 🟠 1 🟡 1 open · Ready to commit with 1 important
```

The scope string is `<what> (<HEAD short hash>[+dirty], <N> files)`: `<what>` is the argument as given (`develop`,
`develop..HEAD`) or `working tree` for the empty argument; `+dirty` is present when the review included
uncommitted changes (empty argument, or a `<base>` run with a dirty tree). Round 1 in the example was made
before the commit, round 2 after it.

Statuses — one per row:

| Status | Meaning | Who sets it |
|---|---|---|
| `open (rN)` | found in round N, still present | the review |
| `fixed (rM)` | round M verified that the code no longer has the defect (re-run the proof, or the code is gone) | the review only — a fix applied in the session is **not** marked fixed until a round confirms it |
| `wontfix` | the user decided not to address it | the agent, when the user says so (in a review round or right after) |

Rules for every round after the first:

1. For each `open` row, re-check the current code: re-run the proof or look at the location. Fixed → `fixed (rN)`.
   Still there → keep `open (rN-1)` (the round it was found in), update `Where` if the line moved.
2. New findings get the next free numbers; never renumber or delete rows.
3. Update the header line and append a `## Rounds` entry.

## 6. Output in the chat

Print the scope line, a one-line delta since the previous round (skip it on round 1), **one table with the open
rows only** — new and carried-over — sorted 🔴 → 🟠 → 🟡 (by impact within a group), then the verdict and, when
something is open above 🟡, the re-run hint. Nothing else — no prose summary before or after, no repeating the
findings in text. Fixed and `wontfix` rows live in the log, not in the chat.

```
Reviewed: develop (77b0a62, 7 files) · round 2 · log: .runtime/code-review/common--setup-skill.md
Since round 1: 1 fixed (#1), 1 still open (#2), 1 wontfix (#3)

| # | Sev | Where | Problem | Proof | Fix | Status |
|---|-----|-------|---------|-------|-----|--------|
| 4 | 🔴 | scripts/setup-env.sh:57 | … | … | … | new (r2) |
| 2 | 🟠 | .claude/skills/setup/SKILL.md:88 | … | unverified: … | … | open (r1) |

Verdict: Not ready — 1 blocker, 1 important.
Fix what you choose to, then run /code-review again: the log gets the fixed marks, the chat gets the fresh table.
```

- **Where:** `path:line` of the diff (the new file's numbering); one primary location per row.
- **Problem:** one sentence, the defect and its consequence; no rationale essays.
- **Proof:** the command and its output, the test name, the rule / doc reference, or `unverified: …`; `—` for a nit.
- **Fix:** the concrete change in a few words. Do **not** apply it — the user decides.
- **Status** in the chat: `new (rN)` for this round's findings, `open (rK)` for carried-over ones.

Verdict, one line:

- `Ready to commit.` — no 🔴 and no 🟠 open (nits may be listed).
- `Ready to commit with N important.` — no 🔴 open; the user chooses whether to address the 🟠 rows first.
- `Not ready — N blockers, M important.` — at least one 🔴 open.

If the diff is empty, say so and stop (no log entry).
