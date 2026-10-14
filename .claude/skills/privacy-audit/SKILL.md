---
name: privacy-audit
description: Audit the current changes for personal-data / privacy compliance (152-ФЗ): policy and terms text, document versions, consent invariants. Use when a change touches user data, consents or the legal pages, or when the user runs /privacy-audit.
argument-hint: "[<base> | <base>..<head>]"
---

# privacy-audit

Act as a data-protection engineer. Audit a change set for personal-data / privacy compliance against
[personal-data-compliance](../../rules/personal-data-compliance.md) (Set Forge is operated under 152-ФЗ): the rule
owns what counts as personal data, the triggers, the files to change and the conventions; this skill checks them.

## 1. Scope

Scope as `/code-review` §1 (the same argument). The audit writes no file, not even a log.

## 2. Relevance

The change is compliance-relevant when it touches a path of the rule's frontmatter `paths`, matches a row of its
"Trigger → required action" table (judged by its "What counts as personal data" — a new DTO field or a migration
of a user-linked table counts), or touches an item of its "Hard invariants". Not relevant → §4.

## 3. Checks

For each relevant change:

1. **Documents updated** — the section that the trigger row names is updated in both RU and EN, in the files of the
   rule's "Where to change things", with the purpose and legal basis of new data, inside the audited change itself;
   a document update left for a later PR is a finding.
2. **Versions bumped** — the row's version and effective date move together, in the places "Where to change things"
   lists; a text change without a bump, or a bump without a text / date change, is a finding.
3. **Invariants intact** — the rule's "Hard invariants" 1–5: for 1–3 every `session/*` id they link that the
   change touches (consent, pending acceptance, the gate with its `/privacy` / `/terms` exception, user-owned data)
   still holds with its `@invariant` test and the code convention of its item; 4–5 as the rule states them.
   `docs/domains/session.md` reflects the change (invariants, flows, Map).
4. **New PD-bearing entity** — on top of §3.1, §3.2 (the first trigger row) and invariant 3 (the cascading FK, the
   cascade e2e spec extended): the Map and invariants of the doc of the entity's own domain updated.

## 4. Output

A concise, actionable checklist grouped as `❌ Must fix before merge`, `⚠️ Should address`, `✅ OK`. For each
`❌`, name the exact file(s) to change and the version(s) / date(s) to bump. A change that is not
compliance-relevant, or is relevant but matches no trigger row and passes every check of §3, gets one line saying
so, why (refactor, rename, test) and that no bump is required — ready for the PR description. If everything is in
order, end with "Privacy: ready to merge".
