import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { FC, Fragment } from 'react';

import { BrandWordmark } from '@shared/ui';

import classes from './legal-document.module.scss';
import { LEGAL_BACK_LABELS, LEGAL_LANG_LABELS } from '../config/legal-labels';
import type { LegalBlock, LegalContent, LegalLang, LegalLink, LegalSection, LegalText } from '../model/legal-content';

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
