import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { FC, Fragment } from 'react';

import { LEGAL_BACK_LABELS, LEGAL_LANG_LABELS, type LegalLang } from '@shared/config';

import classes from './legal-document.module.scss';
import BrandWordmark from '../brand-wordmark/brand-wordmark';

/** An inline link inside paragraph text: `to` for an in-app route, `href` for external (e.g. mailto:). */
type LegalLink = { text: string; to?: '/privacy' | '/terms'; href?: string };

/** Paragraph text: a plain string, or a sequence of strings and inline links. */
type LegalText = string | Array<string | LegalLink>;

type LegalBlock = { type: 'p'; text: LegalText } | { type: 'ul'; items: string[] };

type LegalSection = {
  heading: string;
  /** Paragraphs and/or bullet lists rendered in order. */
  blocks: LegalBlock[];
};

type LegalRichTextProps = { text: LegalText };

const LegalRichText: FC<LegalRichTextProps> = ({ text }) => {
  if (typeof text === 'string') {
    return <>{text}</>;
  }
  return (
    <>
      {text.map((run: string | LegalLink, index: number) => {
        if (typeof run === 'string') {
          return <Fragment key={index}>{run}</Fragment>;
        }
        if (run.to) {
          return (
            <Link key={index} to={run.to} className={classes.link}>
              {run.text}
            </Link>
          );
        }
        return (
          <a key={index} href={run.href} className={classes.link}>
            {run.text}
          </a>
        );
      })}
    </>
  );
};

export type LegalContent = {
  title: string;
  effectiveLabel: string;
  intro: string;
  sections: LegalSection[];
};

type Props = {
  doc: LegalContent;
  lang: LegalLang;
  effectiveDate: string;
  onLangChange: (lang: LegalLang) => void;
  onBack: () => void;
};

const LegalDocument: FC<Props> = ({ doc, lang, effectiveDate, onLangChange, onBack }) => {
  return (
    <div className={classes.page}>
      <div className={classes.card}>
        <header className={classes.header}>
          <div className={classes.topBar}>
            <button type="button" className={classes.backLink} onClick={onBack}>
              <ArrowLeft size={18} strokeWidth={1.75} aria-hidden />
              {LEGAL_BACK_LABELS[lang]}
            </button>
            <div className={classes.langSwitch} role="group" aria-label="Language">
              {(Object.keys(LEGAL_LANG_LABELS) as LegalLang[]).map((code: LegalLang) => (
                <button
                  key={code}
                  type="button"
                  className={code === lang ? `${classes.langButton} ${classes.langButtonActive}` : classes.langButton}
                  aria-pressed={code === lang}
                  onClick={(): void => onLangChange(code)}
                >
                  {LEGAL_LANG_LABELS[code]}
                </button>
              ))}
            </div>
          </div>
          <BrandWordmark title="Set Forge" titleAs="h1" className={classes.wordmark} />
          <h2 className={classes.title}>{doc.title}</h2>
          <p className={classes.effective}>
            {doc.effectiveLabel}: {effectiveDate}
          </p>
        </header>

        <p className={classes.intro}>{doc.intro}</p>

        {doc.sections.map((section: LegalSection) => (
          <section key={section.heading} className={classes.section}>
            <h3 className={classes.sectionHeading}>{section.heading}</h3>
            {section.blocks.map((block: LegalBlock, index: number) =>
              block.type === 'p' ? (
                <p key={index} className={classes.paragraph}>
                  <LegalRichText text={block.text} />
                </p>
              ) : (
                <ul key={index} className={classes.list}>
                  {block.items.map((item: string) => (
                    <li key={item} className={classes.listItem}>
                      {item}
                    </li>
                  ))}
                </ul>
              ),
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default LegalDocument;
