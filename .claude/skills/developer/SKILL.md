---
name: developer
description: Gated implementation of a task from its issue to a reviewed commit — intake → understanding (root cause for a bug) → scope / breakdown into sub-branches → reuse & reach → HLD with 3 options → LLD iterations → manual or autonomous implementation → /code-review → an optional check on the verification stand → one commit, with an approval gate after every step, the work in its own worktree by default and artifacts kept per task in .runtime/tasks/ of the main checkout. Use when the user wants to implement / take into work / fix an issue ("берём #12", "implement #12"), resumes a task on its branch, or runs /developer.
argument-hint: "[#<issue> | <task without an issue>]"
---

# developer

Act as the developer of the pipeline: `/analyst` wrote the requirements, you turn them into a reviewed commit. The
work goes in numbered steps; **every step ends with a gate** — its result is discussed first and saved only after an
explicit yes, so a wrong turn costs one step, not the whole task. Acceptance against the criteria is not yours: it
belongs to the testing stage after the PR.

Talk in the user's language; artifacts, code, commits and the PR are in English.

## Rules

- **Gate** = ask plainly "is this correct — do we proceed?" and stop. Silence or a follow-up question is not a yes.
- **Save on approval:** after the yes, first save the step's artifacts and update `status.md`, then go on. Never save
  before the yes.
- **No skipping.** Unsure which step you are on → read `status.md`.
- **Repository rules apply:** branch operations through `/branches` (its gate), commits through the `/commit`
  template, no push — except the first push of a shared branch that step 3 names in its gate.
  `.claude/rules/*`, `CLAUDE.md` and the domain docs bind the code you write.
- **Research before you propose** (§4). A business rule that neither the issue nor the domain docs state is a
  question for the user (or a change of the requirements through `/analyst #N`), never a guess.

## 1. The task workspace

The artifacts live in the task folder of `/branches` §2 — `.runtime/tasks/<N>/` **of the main checkout**,
`part-<n>/` for a sub-branch, the branch slug for a branch without a task — gitignored, kept between sessions and
shared by every worktree. The same folder holds the `/code-review` log and the stand check.

```
.runtime/tasks/<N>/
  status.md          # the single source of where the task is
  understanding.md
  breakdown.md       # only when split
  reuse.md
  hld.md
  lld.md
  code-review.md     # written by /code-review
  stand-check.md     # the check on the verification stand (step 8), when chosen
  part-<n>/          # one part of a split task = one sub-branch; the same files
```

`status.md`:

```
# <N> <issue title>
Status: <step N: name> | <in progress | done> · mode: <manual | autonomous | —> · stand: <yes | no | —>
Branch: <branch> · Worktree: <.claude/worktrees/<key> | main checkout> · Parent: <../ or —>

## Steps
- [x] 2 Understanding
- [ ] 3 Scope
- [ ] 4 Reuse & reach
- [ ] 5 HLD
- [ ] 6 LLD
- [ ] 7 Implement
- [ ] 8 Finish

## Iterations
- [ ] 1 <name>

## Parts (when split)
- [ ] part-1 — <goal> — <status>
```

A split (parent) task tracks steps 2, 3 and Parts only; steps 4–8 live in its parts.

## 2. Steps

| # | Step | You produce | Gate → on yes save |
|---|---|---|---|
| 1 | Intake | the requirements source | — |
| 2 | Understanding | the goal restated for development; for a bug the root cause | branch + `understanding.md` + `status.md` |
| 3 | Scope | small → one line; large → ordered parts | `breakdown.md` |
| 4 | Reuse & reach | what exists, what the change touches | `reuse.md` |
| 5 | HLD | 3 options, one recommended | `hld.md` |
| 6 | LLD | iterations, HLD consistency check, the mode | `lld.md` |
| 7 | Implement | the iterations, verified | `status.md` per iteration |
| 8 | Finish | review, the stand check, one commit, handoff | `stand-check.md`, `status.md` → done |

**Housekeeping, at every start.** For each worktree under `.claude/worktrees/` (`git worktree list`) look up the PR
of its branch (`gh pr list --head <branch> --state merged`). Merged ones → one line: "the PRs of X and Y are
merged — remove their worktrees?" and remove them on yes (`/branches` §5); their task folders stay.

**1 Intake.** `/developer #N` or a branch of a task (`/branches` §2) → `gh issue view <N> --json
title,body,state,labels,comments,projectItems`: Goal, Scope, the acceptance criteria, Domain impact, and every
`Requirements update:` comment. A closed issue → stop and ask. Status Backlog → say the requirements are not marked
Ready yet and ask whether to go on. No issue → agree in the chat where the requirements come from; do not go on
without a source. An existing `status.md` in the task folder → this is a resume (§5).

**2 Understanding.** Restate the task for development:

```
Goal: one line
Context: how it works now — files and flows may be named here
In scope: …
Out of scope: …
Open questions: …
```

For a bug add `Root cause:` — the hypothesis with its evidence (a reproduction, a log, a failing test), and where it
lives: client, server, env / configuration, or data. A second defect found on the way is not carried along: propose
a new task through `/analyst`.

GATE. The same question names the branch of the task (`/branches` §5): its creation from `origin/develop`, the
move of the card to In progress, and where it lives — **a worktree** `.claude/worktrees/<key>` (the default: your
main checkout and other tasks stay untouched, several tasks run at once) or the current checkout. One yes for all of
it. On yes: create the branch (in a worktree: `git worktree add`, `npm ci`, `npm run setup:env`, then move the
session into it with `EnterWorktree`), the task folder, `understanding.md` and `status.md`. A task without an issue
gets its branch the same way, without the card.

**3 Scope.** Small → say so in one line, GATE, go to step 4. Large → a table `# | Part | Goal`, in execution order.
Each part is one sub-branch `<branch>--<n>` (`/branches` §1) with its folder `part-<n>/`; the task branch becomes
their shared branch. A sub-branch starts from `origin/<shared branch>` (`/branches` §3, §5), so the same gate names
the first push of the task branch (`git push -u origin <branch>`, `/branches` §5) — one yes for the breakdown and the
push. GATE. On yes save `breakdown.md`, push the branch, seed each `part-<n>/status.md`, and ask which part to start.
A part runs steps 2 and 4–8 on its own sub-branch (created through `/branches` §5 at its step 2, gated); its
`understanding.md` starts with `## Parent context` — a link to `../` and a 2–3 line digest of the task, so a fresh
session has the context.

**4 Reuse & reach.** A table, six rows, no prose:

| | |
|---|---|
| **Exists already** | components, hooks, helpers and server services that already do part of the job — `client/src/shared/ui/index.ts`, the slices of the touched domain, `server/src/<module>` |
| **Domain and slice** | the domain doc's Map; the FSD layer and slice the change lands in (`.claude/rules/fsd-architecture.md`) |
| **Reach** | for every file the change touches: who imports it (grep the import path), the invariants of the domain — the `❌ review` ones too — and the snapshot / e2e tests that cover it |
| **Rules that bite** | the `.claude/rules/*.md` whose `paths` match the touched files, and the sections of them this change runs into |
| **Contract** | a change of an endpoint, a DTO or Swagger (`.claude/rules/server-api.md`) — or `none` |
| **Copies** | the same logic elsewhere that a change of behavior must follow — or `none` after a search; `n/a` for a purely additive change |

An issue with a Figma link adds the map of the design to components (Figma MCP `get_design_context`): every row
`exists / to create`. GATE. On yes save `reuse.md`. A wide reach found here shapes the HLD — that is why it comes
first.

**5 HLD.** Research first (§4). A table of 3 rows `Option | Idea | Reuses | Pros | Cons | Difference`, the
recommended one first and marked. Fewer only when there really are no other sensible ways — say so instead of
inventing a straw option. GATE for the pick. On yes save `hld.md` with the choice marked.

**6 LLD.** Deep code research. A table `# | Iteration | Changes (files) | Tests | Result` — few, small iterations.

- A changed business rule changes its invariant and its test in the same task (`CLAUDE.md`); a new invariant gets a
  test tagged `// @invariant <domain>/<id>`.
- The last iteration is **Docs** whenever anything applies: the domain doc (invariants, flows, the Map for a new
  slice or module — `npm run lint:root` fails otherwise), the stories of a new or changed component
  (`.claude/rules/storybook.md`), `/privacy-audit` when the issue's `Privacy` is not `none`. A change that leaves a
  doc wrong is not finished.

Run the HLD consistency check (§3). At the same gate ask two things:

- the mode: **manual** (default) or **autonomous** — autonomous includes one commit and no push (step 8);
- **the stand check** (step 8) — name what it will walk (the acceptance criteria, or for a task without them the
  flows from the reach of step 4) and with which preset (§7):
  - yes by default for any change of how the running app behaves — in the client or in the API alone (a validation,
    a status code, an access rule, a response shape);
  - yes for a refactoring that is large or risky: it touches a wide reach (step 4), a shared piece, the data flow,
    auth, persistence or migrations — the tests prove what they cover, the stand shows the rest still works;
  - no for docs, scripts, tooling, and a small refactoring the tests cover.

GATE. On yes save `lld.md` with both answers (and `hld.md` if it changed).

**7 Implement.** Verify every iteration before it counts:

| Touched | Run |
|---|---|
| `client/` | `npm run client:lint` · `npm run client:test` |
| `server/` | `npm run server:lint` · `npm run server:test:unit` |
| `scripts/`, `docs/`, root configs | `npm run lint:root` |
| a behavior you can see — on screen or in the API — while iterating | the verification stand (§7) |

Update snapshots (`npm run client:test:snap-update`) only for an intended visual change, and say so. The e2e suites
belong to the testing stage.

- **Manual (default).** Per iteration: implement → verify → a table of files and changes → GATE. Changes requested →
  revise and re-gate. Tick the iteration in `status.md` only after the yes; never start N+1 before N is approved.
  At any gate the user may ask for `/code-review` of the work so far instead of a yes.
- **Autonomous.** Binding once chosen: all iterations in order, no gates, questions or progress stops; verify each and
  tick it as you go; a failed check is fixed inside the same iteration. Stop early only for a contradiction that
  needs the user (the approved LLD is provably wrong) or a destructive action outside the plan; anything resolvable
  conservatively — resolve it, note it for the report, continue.

A decision the LLD did not foresee → the HLD consistency check (§3), in both modes.

**8 Finish.**

1. `/code-review <base>` over the whole task, the base by `/branches` §3, before the commit. Manual: one round, then
   the user picks what to fix (the fixes are re-verified and reviewed again). Autonomous: rounds of review → fix
   everything 🔴 and 🟠 → review again, until a round is clean or 5 rounds are spent.
2. **The stand check**, when step 6 chose it — after the review, so the code checked is the code committed:
   start the stand (§7), walk everything it was chosen for, watch the console, the network and the server log, stop
   the stand. Each criterion the way a person would check it: one about the screen in the Browser pane; one about the
   API with HTTP requests, the way a tester uses Postman (§7); a server change that has a path through the UI — both,
   the request proves the contract, the screen proves the client shows it. Write `stand-check.md`:

   ```
   Stand: slot <k> · client <url> · preset <name> · <date>

   | AC | Result | How |
   |---|---|---|
   | AC-1 | ✓ | UI: what was done and seen |
   | AC-2 | ✓ | API: POST /api/1.0/… with … → 400, message "…" |
   | AC-6 | — | why the stand cannot show it |
   ```

   `✓` seen working, `✗` broken, `—` cannot be checked on the stand. A `✗` → fix, verify the iteration, one more
   `/code-review` round on the fix, check that criterion again. Manual: the table goes to the user before the
   commit. Docker is not running → say so; the user starts it or the check is skipped and noted in the report.
3. One commit with the `/commit` template. Manual: `/commit` asks for its approval as usual. Autonomous: choosing the
   mode was that approval — commit without asking. No push in either mode.
4. Report: the iterations, the review rounds and what is still open, the stand check, the commit hash. Set
   `status.md` to done and offer `/pr` — it links the task, carries the acceptance criteria and the stand check, and
   moves the card to In review.

A split task: a part finishes on its sub-branch the same way (its PR goes into the shared branch); after the last
part, the shared branch goes to `/pr` into `develop`.

## 3. HLD consistency check

The approved `hld.md` is what every later step is measured against; a later decision that quietly departs from it
leaves two artifacts that contradict each other.

| When | Compare against | A mismatch is |
|---|---|---|
| LLD agreed (step 6), before its gate | the chosen option of `hld.md` | an iteration uses a different piece than the option reuses, adds a layer or a boundary it does not have, drops a piece it relies on, changes the data flow |
| An implementation decision the LLD did not foresee (step 7) | `hld.md` and `lld.md` | the same; in autonomous mode a conservative resolution still counts |
| A part finished, or a part's decision touches a shared piece | the `hld.md` of the finished sibling parts and `breakdown.md` | a shared component, an interface between parts or an order that they state differently |

On a mismatch: name it in one line, propose the edit of the affected file and gate it together with the step's own
result (in autonomous mode: apply the edit and list it in the report). Never save an LLD or tick an iteration while
the HLD it derives from says something else. A sibling part that has not reached step 5 records the decision under
`## Parent context` of its `understanding.md` instead.

## 4. Research

Read before proposing, in this order:

1. The domain doc of the task (`CLAUDE.md` table → `docs/domains/<domain>.md`): glossary, invariants, flows, Map.
2. The rules that load for the touched paths (`.claude/rules/*.md`, by their `paths`).
3. The code from the Map: signatures, options and call sites come from the files, not from memory.
4. The tests of the touched code — they show the intended behavior and what the change must keep.

## 5. Resuming

`/developer` on a branch of a task, or "continue #N": read `status.md` of the task folder (and the parent's
`understanding.md` for a part), report the current step in one line and go on from there — every save still waits
for its gate. `status.md` names a worktree → move the session into it first (`EnterWorktree` with `path`).

## 6. Task types

The steps are the same; the weight moves.

| Type | Emphasis |
|---|---|
| `bugfix` | step 2 — the root cause with evidence before any design; a test that fails before the fix |
| `feature` | step 3 often splits it; HLD and LLD per part |
| `improvement` | usually small (step 3 is one line); the weight is on steps 4–5 |
| `refactoring` | behavior must not change: step 4's reach is the whole risk assessment, every iteration ends with a no-behavior-change check (the same tests pass unchanged); a large or risky one also walks its reach on the stand (step 6) |
| `common`, `documentation`, `storybook`, `tests` | often without an issue — steps 1–2 agree the source and the goal in the chat; HLD may have fewer real options — say so instead of inventing them |

## 7. The verification stand

The e2e stack kept running for a hand check: its own throwaway MySQL, Nest and Vite on the ports of a free slot
(API `5300+k`, client `5400+k`), so it never touches the user's dev servers (5000 / 5173), their `mysql-dev` or
another session's stand. Code: `client/tests/stand/`.

- Start — in the background (Bash `run_in_background`), from the task's checkout:
  `npm run client:stand -- --preset=<name>`. Wait for the line `[stand] Ready: <client url> …`; the lines before it
  name the slot, and the preset's notes (the login) follow it. Open the client URL in the Browser pane
  (`preview_start` with `url`); the server log is the output of the background task.
- Presets — the state the stand starts in, built through the public API (`client/tests/stand/stand-presets.ts`):
  `empty` (no users — for flows that start at registration), `user` (a registered user without data). A criterion
  that needs more (lists, an active session) gets a new preset there, in the same task — never a hand-made state.
- Stop — `npm run client:stand:stop` (every stand of this checkout) or `-- --slot=<k>`; `-- --list` shows every
  running stand. The stand stops Nest, Vite and its MySQL itself; one that died or was killed is cleaned up by the
  same command (its orphans on the slot's ports, its container). Always stop it before the commit.
- API checks — the API URL is in the `Ready` line, every route under `/api/1.0`. A token: `POST /api/1.0/auth/login`
  with the preset user's login (`user` preset) → `accessToken` → `Authorization: Bearer <token>`. The contract —
  request and response shapes — is the stand's Swagger: `/api/docs`, as JSON `/api/docs-json`. Requests go through
  `curl` or `node -e "fetch(…)"`; record each as method, path, the essential body and what came back.
- The API is built once, at start: a change in `server/` → restart the stand (`client:stand:stop`, then
  `client:stand`). Client changes reach the open page by themselves (Vite).
- Docker is the only prerequisite (`/setup`).
