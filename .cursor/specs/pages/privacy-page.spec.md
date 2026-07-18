# Specification: Privacy Page

## Overview

Public Privacy Policy page on `/privacy`. Presentation-only wrapper around the shared [`LegalDocument`](../shared/shared-components.spec.md#legaldocument) component; the policy text and operator identity live in the page `model`. Related: [user entity](../entities/user.entity.spec.md), [terms-page](terms-page.spec.md).

---

## Route

- Path: `/privacy` (public — listed in root `PUBLIC_PATHS`)
- Router entry: `privacy-page.tsx` (presentation only, no data/logic layer)
- Route file: `client/src/app/model/routes/privacy.tsx`

---

## Location

`client/src/pages/privacy/`

---

## Files

- `ui/privacy-page.tsx` — renders `LegalDocument` with the privacy content.
- `ui/privacy-page.stories.tsx`
- `model/privacy-policy-content.ts` — RU/EN `LegalContent`, `PRIVACY_EFFECTIVE_DATE`, `PRIVACY_OPERATOR`.
- `ui/index.ts`, `index.ts`

---

## UI

### Document

1. Shared `LegalDocument` renders header (back link, RU/EN switch, wordmark, title, effective date), intro, and sections (data-driven).

---

## Current Logic

### Initialization

1. `PrivacyPage` passes `privacyContent` and `PRIVACY_EFFECTIVE_DATE` to `LegalDocument`. No hooks, no server state.

### Operator identity

2. `PRIVACY_OPERATOR.name` is per-language (`{ ru, en }`) and `contactEmail` is language-agnostic; all are injected at build time (via Vite `define`) so the real operator identity stays out of the public source: `VITE_PRIVACY_OPERATOR_NAME_RU` → `__PRIVACY_OPERATOR_NAME_RU__` (RU document) and `VITE_PRIVACY_OPERATOR_NAME_EN` → `__PRIVACY_OPERATOR_NAME_EN__` (EN document), with `VITE_PRIVACY_OPERATOR_NAME` → `__PRIVACY_OPERATOR_NAME__` as a shared fallback, plus `VITE_PRIVACY_CONTACT_EMAIL` → `__PRIVACY_CONTACT_EMAIL__`. Fall back to placeholders when unset (dev, tests, unconfigured build).

---

## Data Model

- Content shape: `Record<LegalLang, LegalContent>` — see [`LegalDocument`](../shared/shared-components.spec.md#legaldocument).
- `PRIVACY_EFFECTIVE_DATE: string` — bumped when the policy text changes.

---

## API usage

None — static content only.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Routing | TanStack Router (public route) |
| UI | shared `LegalDocument` |
| Build-time config | Vite `define` (operator name / contact email) |
| FSD | `pages/privacy`, `shared/ui/legal-document` |

---

## Exposed API / Methods

| API | Type | Description |
|-----|-----|-------------|
| `PrivacyPage` | component | From `pages/privacy/ui` |
| `privacyContent` | const | RU/EN `LegalContent` |
| `PRIVACY_EFFECTIVE_DATE` | const | Effective date string |
| `PRIVACY_OPERATOR` | const | `{ name: { ru, en }, contactEmail }` |

---

## Tests

- Covered by the shared `LegalDocument` unit tests and Storybook.

---

## Storybook

- Title: `Pages/PrivacyPage`
- File: `privacy-page.stories.tsx`
- Decorator: `renderWithPageRouter` at `/privacy`.

---

## Edge Cases

| Scenario | Handling |
|----------|-----------|
| Operator env vars unset | Placeholder operator name / contact email |
| Accessed while logged out | Allowed (public route) |
| Policy text changed | Bump `PRIVACY_EFFECTIVE_DATE` and `PRIVACY_VERSION` (server) — see [personal-data-compliance rule](../../rules/personal-data-compliance.mdc) |

---

## References

- [user.entity.spec.md](../entities/user.entity.spec.md)
- [terms-page.spec.md](terms-page.spec.md)
- [shared-components.spec.md](../shared/shared-components.spec.md#legaldocument)
- [personal-data-compliance.mdc](../../rules/personal-data-compliance.mdc)
