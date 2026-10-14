---
description: Personal-data / privacy compliance — keep Privacy Policy & Terms in sync and versioned when user data or legal-relevant behaviour changes
paths:
  - "server/src/users/**"
  - "server/src/auth/**"
  - "server/src/security/**"
  - "server/database/migrations/**"
  - "server/src/common/constants/document-versions.ts"
  - "client/src/entities/session/**"
  - "client/src/pages/privacy/**"
  - "client/src/pages/terms/**"
  - "client/src/widgets/document-reconsent/**"
---

# Personal-Data & Privacy Compliance

Set Forge is operated under Russian 152-ФЗ. The Privacy Policy and Terms of Use are **contracts with the user**, not
just docs: they must always describe the code's *actual* data handling, and users must re-accept when they change
materially. Treat any change under the paths above as potentially compliance-relevant.

## What counts as "personal data" (PD)

Anything tied to an identifiable user: `email`, `password` (hash), workout data the user enters, technical/log data
(IP, user-agent, session id), the document-acceptance columns, and any **new** column/field/log/third-party call that
stores, exposes, or transmits user-linked data.

## Trigger → required action

When a change does any of the following, the linked document(s) MUST be updated in the same change as the code (a
later PR is a finding — `/privacy-audit` §3) and the version bumped.

| Change | Update | Bump |
|--------|--------|------|
| New/changed PD collected, stored, logged, or exposed (e.g. new `users` column, new field on `CurrentUser`/`GetCurrentUserResponse`, new log of user data) | Privacy Policy "1. What data we process" (+ purpose & legal basis in "2. Purposes and legal bases") | `PRIVACY_VERSION` + `PRIVACY_EFFECTIVE_DATE` |
| New third party / sub-processor, analytics, tracker, ad network, or data leaves the RF | Privacy Policy "4. Sharing with third parties" / "3. Where and how long data is stored" | `PRIVACY_VERSION` + `PRIVACY_EFFECTIVE_DATE` |
| Change to retention, deletion, or data-subject rights (e.g. account-deletion flow, export) | Privacy Policy "6. Your rights" / "3. Where and how long data is stored" | `PRIVACY_VERSION` + `PRIVACY_EFFECTIVE_DATE` |
| New cookie beyond strictly-necessary session | Privacy Policy "5. Cookies" | `PRIVACY_VERSION` + `PRIVACY_EFFECTIVE_DATE` |
| Change to user obligations, service scope, liability/health disclaimer, governing law, or contact | Terms of Use relevant section | `TERMS_VERSION` + `TERMS_EFFECTIVE_DATE` |

A purely internal change that alters neither *what* PD is handled nor *what* the user agreed to (refactor, rename,
test) needs no bump — say so in the PR description (`/privacy-audit` §4 gives the line). The headings above are the
EN ones of the policy; the RU text has the same numbering.

## Where to change things (keep in sync)

- **Privacy text (RU + EN):** `client/src/pages/privacy/config/privacy-policy-content.ts` — update both languages;
  bump `PRIVACY_EFFECTIVE_DATE`.
- **Terms text (RU + EN):** `client/src/pages/terms/config/terms-content.ts` — update both languages; bump
  `TERMS_EFFECTIVE_DATE`.
- **Required versions (server, runtime):** `TERMS_VERSION` / `PRIVACY_VERSION` env (read via
  `server/src/common/constants/document-versions.ts`); update `server/.production.env.example` and the deploy guide.
  Increment the number so users with a lower stored version are re-prompted.
- **Effective date and env version must move together:** a text change without a version bump means users silently
  keep an outdated acceptance; a version bump without a text/date change forces a pointless re-consent.

## Hard invariants (do not break)

Items 1–3 are business invariants owned by [session](../../docs/domains/session.md): they link them by id and add
only the code conventions that keep them. Items 4–5 are this rule's own conventions.

1. **Separate consent** — `session/separate-consent`. The registration DTO declares `consent` and `termsAccepted` as
   two distinct, non-defaulted `@Equals(true)` fields: never merged, never defaulted to `true`.
2. **Re-consent gate** — `session/pending-derived` and `session/reconsent-gate`, the `/privacy` / `/terms`
   exception included.
3. **Deletion cascade** — `session/deletion-cascade`. A new user-owned table MUST add a cascading FK to `users` and be
   covered by `server/test/e2e/account-deletion-cascade.e2e-spec.ts`.
4. **Operator identity stays out of source.** Real operator name / contact come from build-time env — the
   per-language operator name (`VITE_PRIVACY_OPERATOR_NAME_RU` / `VITE_PRIVACY_OPERATOR_NAME_EN`, with
   `VITE_PRIVACY_OPERATOR_NAME` as a shared fallback) and `VITE_PRIVACY_CONTACT_EMAIL`; do not hardcode real values in
   the repo.
5. **Data localization & minimization.** Data the policy names as not collected (full name, phone, address,
   payments, biometrics, analytics) is new PD — the first trigger row, policy first; data leaving the RF — the
   second.

## When adding a new PD-bearing entity

A new PD-bearing entity meets invariant 3, the first row of the trigger table, and the Map and invariants of
`docs/domains/session.md` and of its own domain doc; `/privacy-audit` §3 lists the checks.

## Related

- Domain: [session](../../docs/domains/session.md) — the `session/*` invariants (consents, re-consent gate, account
  deletion)
- Server API conventions: [server-api.md](server-api.md)
- Command: run `/privacy-audit` to audit a change against this rule.

## Enforcement

| Rule | Checked by |
|---|---|
| Separate, explicit consent and terms acceptance at registration | `npm run server:test:unit` · `server/src/auth/dto/register.request.spec.ts` |
| Account deletion removes all user-owned data | `npm run server:test:e2e` · `server/test/e2e/account-deletion-cascade.e2e-spec.ts` |
| Re-consent gate stays closed on the legal pages and blocks the other routes | `npm run client:test:unit` · `client/src/widgets/document-reconsent/ui/specs/document-reconsent-gate.spec.unit.tsx` |
| Policy / terms text matches the data handling; versions and dates bumped together | ❌ review (run `/privacy-audit`) |
| No real operator identity in the repo; no new PD without a policy update | ❌ review |
