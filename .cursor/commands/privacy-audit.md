# privacy-audit

Act as a data-protection engineer. Audit the current changes for personal-data / privacy compliance, following [.cursor/rules/personal-data-compliance.mdc](../rules/personal-data-compliance.mdc) (Set Forge is operated under 152-ФЗ).

**First**, gather the diff:
- Run `git add .` to stage new, modified, and deleted files.
- Run `git diff HEAD` to get all changes since the last commit. If the user names a base branch/commit, use `git diff <base>...HEAD` instead. Review only the changed lines.

**Then**, decide whether the change is compliance-relevant. Flag it if it does any of the following:
1. Collects, stores, logs, exposes, or transmits any new/changed **personal data** (new `users` column, new field on `CurrentUser` / `GetCurrentUserResponse`, new log of user data, new DTO field, new migration touching user-linked tables).
2. Adds a third party / sub-processor, analytics, tracker, ad network, new cookie, or sends user data outside the RF.
3. Changes retention, deletion, export, or data-subject rights (e.g. the account-deletion flow, cascade FKs).
4. Changes user obligations, service scope, liability/health disclaimer, governing law, or contact (Terms of Use).
5. Touches consent at registration, the re-consent gate, or `documentsPendingAcceptance` logic.

**For each relevant change**, verify and report:
- **Docs updated?** Is the Privacy Policy (`client/src/pages/privacy/model/privacy-policy-content.ts`) and/or Terms (`client/src/pages/terms/model/terms-content.ts`) updated in **both** RU and EN to match the new behaviour (data described, purpose, legal basis)?
- **Version bumped?** Is `PRIVACY_VERSION` / `TERMS_VERSION` incremented (`server/.production.env.example` + deploy guide) **and** the matching `*_EFFECTIVE_DATE` updated, together? A text change without a version bump (or vice versa) is a finding.
- **Invariants intact?** Separate `consent` + `termsAccepted` (non-defaulted `@Equals(true)`); `documentsPendingAcceptance` stays derived, not persisted; account-deletion cascade still removes all user-owned data (new user-owned table → cascading FK + `account-deletion-cascade.e2e-spec.ts` coverage); operator identity stays in build-time env, not hardcoded; no newly-collected data that the policy claims is not collected.
- **Specs updated?** `.cursor/specs/entities/user.entity.spec.md` and relevant page specs reflect the change.

**Output** a concise, actionable checklist grouped as: `❌ Must fix before merge`, `⚠️ Should address`, `✅ OK`. For each `❌`, name the exact file(s) to change and the version(s)/date(s) to bump. If the change is not compliance-relevant, say so explicitly and note that no bump is required. If everything is in order, give a "Privacy: ready to merge" signal.

This command will be available in chat with /privacy-audit
