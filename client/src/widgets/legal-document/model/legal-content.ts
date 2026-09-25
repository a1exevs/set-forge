// TODO Support language switcher across the site
export type LegalLang = 'ru' | 'en';

/** An inline link inside paragraph text: `to` for an in-app route, `href` for external (e.g. mailto:). */
export type LegalLink = { text: string; to?: '/privacy' | '/terms'; href?: string };

/** Paragraph text: a plain string, or a sequence of strings and inline links. */
export type LegalText = string | Array<string | LegalLink>;

export type LegalBlock = { type: 'p'; text: LegalText } | { type: 'ul'; items: string[] };

export type LegalSection = {
  heading: string;
  /** Paragraphs and/or bullet lists rendered in order. */
  blocks: LegalBlock[];
};

/** One language version of a legal document (privacy policy, terms of use). */
export type LegalContent = {
  title: string;
  effectiveLabel: string;
  intro: string;
  sections: LegalSection[];
};
