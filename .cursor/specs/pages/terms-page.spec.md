# Specification: Terms Page

## Overview

Public Terms of Use page on `/terms`. Presentation-only wrapper around the shared [`LegalDocument`](../shared/shared-components.spec.md#legaldocument) component; the terms text lives in the page `model`. Related: [user entity](../entities/user.entity.spec.md), [privacy-page](privacy-page.spec.md).

---

## Route

- Path: `/terms` (always-public — listed in root `ALWAYS_PUBLIC_PATHS`; no auth required, no guest-only redirect)
- Router entry: `terms-page.tsx` (presentation only, no data/logic layer)
- Route file: `client/src/app/model/routes/terms.tsx`

---

## Location

`client/src/pages/terms/`

---

## Files

- `ui/terms-page.tsx` — renders `LegalDocument` with the terms content.
- `ui/terms-page.stories.tsx`
- `model/terms-content.ts` — RU/EN `LegalContent`, `TERMS_EFFECTIVE_DATE`.
- `ui/index.ts`, `index.ts`

---

## UI

### Document

1. Shared `LegalDocument` renders header (Back button, RU/EN switch, wordmark, title, effective date), intro, and sections (data-driven). Includes a health/liability disclaimer and cross-links to the Privacy Policy.

---

## Current Logic

### Initialization

1. `TermsPage` passes `termsContent` and `TERMS_EFFECTIVE_DATE` to `LegalDocument`. No hooks, no server state.

### Contact

2. The contact email is the same build-time value as the Privacy Policy (`__PRIVACY_CONTACT_EMAIL__`), shown directly as a `mailto:` link; falls back to a placeholder when unset.

### Re-consent gate

3. The root `DocumentReconsentGate` is **suppressed** on `/terms` (and `/privacy`) even when `documentsPendingAcceptance` is true, so a user who must re-accept can still read the document. The gate returns when they navigate back to an app route.

---

## Data Model

- Content shape: `Record<LegalLang, LegalContent>` — see [`LegalDocument`](../shared/shared-components.spec.md#legaldocument).
- `TERMS_EFFECTIVE_DATE: string` — bumped when the terms text changes.

---

## API usage

None — static content only.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Routing | TanStack Router (public route) |
| UI | shared `LegalDocument` |
| Build-time config | Vite `define` (contact email) |
| FSD | `pages/terms`, `shared/ui/legal-document` |

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|-------------|
| `TermsPage` | component | From `pages/terms/ui` |
| `termsContent` | const | RU/EN `LegalContent` |
| `TERMS_EFFECTIVE_DATE` | const | Effective date string |

---

## Tests

- Covered by the shared `LegalDocument` unit tests and Storybook.

---

## Storybook

- Title: `Pages/TermsPage`
- File: `terms-page.stories.tsx`
- Decorator: `renderWithPageRouter` at `/terms`.

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| Contact env var unset | Placeholder contact email |
| Accessed while logged out | Allowed (public route) |
| Terms text changed | Bump `TERMS_EFFECTIVE_DATE` and `TERMS_VERSION` (server) — see [personal-data-compliance rule](../../rules/personal-data-compliance.mdc) |

---

## References

- [user.entity.spec.md](../entities/user.entity.spec.md)
- [privacy-page.spec.md](privacy-page.spec.md)
- [shared-components.spec.md](../shared/shared-components.spec.md#legaldocument)
- [personal-data-compliance.mdc](../../rules/personal-data-compliance.mdc)
