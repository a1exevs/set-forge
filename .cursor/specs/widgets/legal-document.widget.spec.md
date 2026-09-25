# Specification: LegalDocument widget

`client/src/widgets/legal-document/` — moved from `shared/ui`: it knows this app's routes (`/privacy`, `/terms`, `/login`) and brand, so it is not domain-agnostic. Consumers: `pages/privacy`, `pages/terms`. Public API: `LegalDocument`, types `LegalContent`, `LegalLang`.

Segments: `ui/` (component + logic layer, styles, stories, specs), `model/legal-content.ts` (content types), `config/legal-labels.ts` (RU/EN labels).


### Purpose

Renders a structured legal document (Privacy Policy, Terms of Use) from a data model, with a RU/EN language switch, an effective-date header, and a Back button. Keeps the two legal pages presentation-free — each page only supplies content and an effective date.

### Location

`widgets/legal-document/`

### Files

- `legal-document-logic-layer.tsx` — language state + router-history Back handler; public default export (no data layer, so the logic layer is exported).
- `legal-document.tsx` — pure presentation renderer + exported content types.
- `legal-document.module.scss` — page, card, language switch, section, list styles.
- `legal-document.stories.tsx` — Storybook (wrapped in a memory `RouterProvider`).
- `specs/legal-document.spec.unit.tsx` — unit tests.

### Props

```typescript
type Props = {
  content: Record<LegalLang, LegalContent>;
  effectiveDate: string;
  backTo?: '/login' | '/register';
};
```

- `LegalLang` — `'ru' | 'en'` (default `'ru'`).
- `LegalContent` — `{ title, effectiveLabel, intro, sections }`.
- `LegalSection` — `{ heading, blocks }` where a block is `{ type: 'p'; text: LegalText }` or `{ type: 'ul'; items: string[] }`.
- `LegalText` — a plain string or a sequence of strings and inline `LegalLink`s (`{ text, to?, href? }`) for in-app routes (`to`) or external links such as `mailto:` (`href`).
- `backTo` defaults to `/login` and is used only as a fallback (see Behavior).

### Tech stack

| Category | Technology |
|----------|------------|
| UI | TanStack Router `Link` / `useRouter`, `lucide-react` (`ArrowLeft`), shared `BrandWordmark` |
| State | local `useState` for the selected language |
| Styling | SCSS Modules |

### UI

- Header: Back button + RU/EN language switch (`role="group"`, `aria-pressed`), `BrandWordmark`, title, effective date.
- Intro paragraph, then sections; each section renders paragraphs and bullet lists in order.

### Behavior

- Language switch toggles between `content.ru` and `content.en` in place.
- Back button: steps back through router history (`router.history.canGoBack()` → `back()`) so the user returns to where they came from (e.g. Profile); when there is no in-app history (direct load / new tab) it navigates to `backTo`.
- Inline links: `to` → router `Link`; `href` → plain anchor.

### Accessibility

- Language buttons expose `aria-pressed`; language group has `aria-label="Language"`.

### Storybook

- Title: `Widgets/LegalDocument`
- File: `legal-document.stories.tsx`
- Stories: Desktop4k/Desktop/Tablet/Mobile with sample RU/EN content.

### Tests

- Unit: `specs/legal-document.spec.unit.tsx` — default language render, EN switch, Back button (history back vs `backTo` fallback).

### Usage

- `pages/privacy/ui/privacy-page.tsx` — Privacy Policy (`privacyContent`, `PRIVACY_EFFECTIVE_DATE`).
- `pages/terms/ui/terms-page.tsx` — Terms of Use (`termsContent`, `TERMS_EFFECTIVE_DATE`).

---

