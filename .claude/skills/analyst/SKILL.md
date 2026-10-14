---
name: analyst
description: Turn a feature request into a GitHub issue with acceptance criteria on the Set-forge project board, clarifying the requirements first, and update the requirements of an open issue (a closed one is frozen — a rework is a new issue). Also the single source of the task model (board, statuses, sizes, issue format, parent issues and sub-issues) that /branches, /developer and /pr refer to. Use when the user describes what they want to see in the product, asks to file / write up a task ("оформи задачу"), changes the requirements of an issue, or runs /analyst.
argument-hint: "[<request> | #<issue> <change>]"
---

# analyst

Act as a business analyst. The user is the customer: they say what they want to see, you find the gaps, close them
with questions and write the requirements down as a GitHub issue on the project board. You describe **what** and
**why**, never **how**: no solution design, file names or code in the issue, no branches, no commits.

Talk in the user's language; the issue, its comments and the PR text are in English.

Two modes, by `$ARGUMENTS`:

- `/analyst <request>` — a new task (§3).
- `/analyst #<N> <change>` — a change of the requirements of issue `#N` (§4).

## 1. The task model

The single source of the task rules: `/branches`, `/developer` and `/pr` refer here instead of repeating them.

- **Task** = a GitHub issue of `a1exevs/set-forge`. A task is optional for every work type; a branch of a task
  carries its number (`/branches` §2).
- **An issue is a change request, not the spec.** It records what had to change and why at that time and is frozen
  once closed. The current requirements are the code and `docs/domains/*.md` (invariants proven by tests); a later
  change of the same feature is a new issue that links the old one (`Reworks #<N>`), never an edit of it.
- **Board** = the private user project **Set-forge**, owner `a1exevs`, number `9`
  (https://github.com/users/a1exevs/projects/9), linked to the repository. Issues are added to it by the skills
  (the board's auto-add is off); pull requests are not added — they show in the task's "Linked pull requests".
  `gh` needs the `project` scope for it (`/setup` §2).
- **Type** = the issue label, one of the work branch types of `/branches` §2 (never `testing` / `release`). The board
  has no type field: the label is it.
- **Fields** the skills set: `Status` and `Size`. `Priority` and the date fields are not used.

### Statuses

| Status | Meaning | Set by |
|---|---|---|
| Backlog | requirements written, not yet agreed to be taken | `/analyst` on create (§3) |
| Ready | requirements agreed, the task can be picked up | the user on the board |
| In progress | a branch of the task exists | `/branches` §5, when it creates a branch whose name carries the number (`/developer` step 2) |
| In review | a PR of the task is open — into `develop`, or for a sub-issue into the parent branch, where it stays after the merge | `/pr` (and the board workflow "Pull request linked to issue" for a PR into `develop`) |
| Done | the PR into `develop` is merged and closes the issue — for a sub-issue, the PR of its parent branch | the board workflow "Item closed" (`Closes #N` closes the issue on merge) |

A sub-branch and its PR into the shared branch never change the status. A branch made by hand outside the skills
does not move the card either.

The board workflows (set in the board's UI — the API cannot change them) are on: "Item added to project" → Backlog,
"Pull request linked to issue" → In review, "Item closed" → Done. Off: "Auto-add to project", "Auto-add sub-issues to
project", "Auto-close issue", and "Pull request merged" — it moves the cards of pull requests, and pull requests are
not on the board. A card that stays behind after a merge → check these first
(`gh api graphql` → `ProjectV2.workflows { name enabled }`).

### Sizes

| Size | Effort |
|---|---|
| XS | about an hour |
| S | up to half a day |
| M | 1–2 days |
| L | up to a week — big work: one issue, or a parent with sub-issues (below) |
| XL | too big to go as one piece — big work (below) |

### Big work: one issue or a parent with sub-issues

A big request (L or XL) is shaped by acceptance — can the customer accept it piece by piece?

- **A parent with sub-issues** — outcomes the customer can accept one by one: a parent issue holds the whole goal,
  each sub-issue is a full issue with its own criteria, branch, PR and review (`/branches` §1).
- **One issue** — an outcome that means something only as a whole: one issue, one PR, one acceptance.

How the work is cut technically — `--<n>` parts, their order, what runs in parallel — is not a requirement:
`/developer` decides it (its step 3). A sub-issue never gets sub-issues of its own.

### Setting a field

Ids are never stored; resolve them at run time:

1. Project id — `gh project view 9 --owner a1exevs --format json --jq .id`.
2. Field and option ids — `gh project field-list 9 --owner a1exevs --format json` (`Status` → `Ready`, …).
3. Item id — `gh project item-add 9 --owner a1exevs --url <issue url> --format json --jq .id`; it returns the
   existing item when the issue is already on the board, so it is also the lookup.
4. `gh project item-edit --project-id <project id> --id <item id> --field-id <field id>
   --single-select-option-id <option id>`.

The current status of an issue: `gh issue view <N> --json projectItems --jq '.projectItems[] |
select(.title == "Set-forge") | .status.name'`.

### The issue

Title — the outcome, in English, no `[Type]` prefix, sentence case: `Exercise cards in workout preview`.

Body — one of two templates; the section names are fixed (`/pr` copies `## Acceptance criteria`, `/branches` §3
reads `## Parent`).

**The issue** — a task, a sub-issue included:

```markdown
## Parent
#<P> <parent title> | none

## Goal
<who> wants <what> so that <why>.

## Context
How the product behaves now and why that is not enough. Links: docs/domains/<domain>.md · Reworks #<N> | none

## Scope
In:
- …
Out:
- …

## Acceptance criteria
- **AC-1** Given … When … Then …
- **AC-2** …

## Domain impact
Invariants: new `<domain>/<id>` — … · changed `<domain>/<id>` — … · none
Privacy: <the personal data touched> → /privacy-audit | none

## Assumptions
- **A-1** … (default accepted for question <n>)

## Size
<XS|S|M|L|XL> — <one-line reason>
```

**The parent** — the same template without `## Parent`, holding the whole goal, size L or XL; `## Sub-issues`
after `## Scope`, and no criteria of its own:

```markdown
## Sub-issues
- #<a> <title> — first
- #<b> <title> — after #<a>

## Acceptance criteria
See the sub-issues; the parent is done when every sub-issue is done.
```

- `## Parent` and `## Sub-issues` are where every skill reads the parent and the sub-issues from (`/branches` §3);
  the same link is set on GitHub (`gh issue create --parent <P>`) for the board. `## Sub-issues` gives only the
  order of the requirements (`after #<n>`: one builds on what the other delivers). An older issue without them:
  `gh issue view <N> --json parent` / `gh issue view <P> --json subIssues`.
- Every criterion is observable by the customer and checkable at acceptance; one behavior per criterion.
- Criterion ids are stable: a changed criterion keeps its id, a removed one leaves its id unused, a new one takes the
  next free number. Never renumber — a PR ticks criteria by id.
- `Domain impact` names the invariants of `docs/domains/*.md` by id; `Privacy` is any new or changed personal data in
  the sense of `.claude/rules/personal-data-compliance.md`.
- No section is dropped: an empty one says `none`.

## 2. Context first

Before any question:

1. Find the domain in the table of `CLAUDE.md` and read its `docs/domains/*.md`: glossary, invariants, flows.
2. Read the code from the domain's Map only as far as needed to describe the **current** behavior — read-only, and
   none of it goes into the issue as files or design.
3. Look for duplicates: `gh issue list --repo a1exevs/set-forge --state open --search "<keywords>"`. A likely one →
   show it and ask whether this is a new task or a change of that one (§4).
4. Look for history: the same search with `--state closed`. A closed issue that built the behavior being changed
   goes into Context as `Reworks #<N>` — a link only: the current behavior comes from steps 1–2, not from old
   issues, and a closed issue is never edited (§1).

## 3. New task

1. **Context** — §2.
2. **Clarify.** Ask only about real gaps, as a numbered list grouped by topic, at most 7 questions a round. Every
   question carries the default you would take (`3. Empty list — hide the Export button? Default: show it
   disabled.`), so the user can answer `1 — yes, 2 — default`. Go through:
   - goal and who needs it; what is in and out of scope;
   - edge cases and states: empty, loading, error, long text, many items;
   - conflicts with an invariant — name its id and ask: change the rule or make an exception;
   - personal data;
   - anything the size depends on.

   A default the user accepts becomes an assumption (`A-n`). Repeat rounds until no gap blocks the criteria; if
   there is no gap, ask nothing.
3. **Size.** Estimate by §1 Sizes. L or XL → propose the shape of §1 Big work as one question, its reason in it:
   `Shape — a parent with 3 sub-issues: the language choice, the server errors and the screens can each be accepted
   on their own? Default: yes.`
4. **Draft.** Show the title, the label, the size and the whole body, and the branch the task will get
   (`/branches` §2; the number is known after creation) — for a parent, itself and every sub-issue with its label and
   branch (`/branches` §5 Branches at the start).
5. **Gate.** Ask: "Create the issue with these details?" — for a parent: "Create the parent and its <n> sub-issues,
   then fill their numbers into the parent's `## Sub-issues`?" Wait for an explicit yes; a change request → back to
   the draft.
6. **Create.** Write the body to a file in the scratchpad directory (never into the repository), then:
   ```bash
   gh issue create --repo a1exevs/set-forge --title "<title>" --body-file <file> --label <type> \
     --assignee @me --project Set-forge
   ```
   Set `Status` = Backlog and `Size` (§1 Setting a field). A parent with sub-issues: the parent first (its
   `## Sub-issues` by title), then every sub-issue with `## Parent` = `#<P> <title>` and `--parent <P>` added to
   the same command (the board's auto-add of sub-issues is off — `--project` puts each on it), then
   `gh issue edit <P> --body-file <file>` with the numbers filled into `## Sub-issues`; status and size for every
   issue.
7. **Report** the issue link and number, its status and size, and the branch name with the number — for a parent,
   itself and every sub-issue, with their branches. Next steps: the user moves the card to Ready when the
   requirements are agreed; the work starts with `/developer #<N>` — for a parent, with a sub-issue.

## 4. Changing requirements

1. `gh issue view <N> --json title,body,state,labels,closedByPullRequestsReferences`. A closed issue is frozen (§1):
   do not edit it — say so and propose a new task (§3) with `Reworks #<N>` in Context.
2. **Clarify** the change only, as in §3 step 2, against the current body and §2 context.
3. **Draft** the new body: show only the changed sections, before → after, and the criteria by id (kept, changed,
   added, removed — §1 The issue). Update `Size` when the change moves it.
4. **Open PR.** The open PR of the issue's own branch carries the criteria as checkboxes (`/pr` step 3). For a task it
   is among `closedByPullRequestsReferences` (a PR with `Closes #N`). For a sub-issue that list holds only its parent's
   PR, which has no criteria — its own PR closes nothing (`/pr` step 3), so find it by its branch — `gh pr list --state
   open --json number,headRefName --jq '.[] | select(.headRefName | test("^[a-z]+/<N>-") and (test("--[0-9]+$") |
   not))'`. Propose its update in the same draft: unchanged criteria keep their tick, a changed one is unticked, a new
   one is added unticked, a removed one is dropped.
5. **Gate.** List what will be written: the issue body, the comment, the size, the PR body. Wait for a yes; the user
   may decline the PR update alone.
6. **Write.**
   - `gh issue edit <N> --body-file <file>`;
   - `gh issue comment <N> --body "Requirements update: <what changed, by id>"` — one short line that is easy to
     search, e.g. `Requirements update: AC-2 reworded (an empty list is allowed), AC-4 added (CSV export).`;
   - the size (§1 Setting a field), if it moved;
   - `gh pr edit <PR> --body-file <file>` with only `## Acceptance criteria` rewritten, if approved.

## 5. Never

- Never create or edit an issue, a comment or a PR without the yes of §3 step 5 / §4 step 5.
- Never put the solution into the issue: no components, endpoints, tables, file paths or code.
- Never create labels, branches or commits; never touch `Priority`.
- Never move a card to Ready, In progress, In review or Done — those belong to the user and the other skills (§1
  Statuses).
