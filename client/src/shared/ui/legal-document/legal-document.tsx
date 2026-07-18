import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { FC, useState } from 'react';

import BrandWordmark from 'src/shared/ui/brand-wordmark/brand-wordmark';
import classes from 'src/shared/ui/legal-document/legal-document.module.scss';

export type LegalLang = 'ru' | 'en';

export type LegalSection = {
  heading: string;
  /** Paragraphs and/or bullet lists rendered in order. */
  blocks: Array<{ type: 'p'; text: string } | { type: 'ul'; items: string[] }>;
};

export type LegalContent = {
  title: string;
  effectiveLabel: string;
  intro: string;
  sections: LegalSection[];
};

type Props = {
  content: Record<LegalLang, LegalContent>;
  effectiveDate: string;
  backTo?: '/login' | '/register';
};

const LANG_LABEL: Record<LegalLang, string> = { ru: 'RU', en: 'EN' };
const BACK_LABEL: Record<LegalLang, string> = { ru: 'Назад', en: 'Back' };

const LegalDocument: FC<Props> = ({ content, effectiveDate, backTo = '/login' }) => {
  const [lang, setLang] = useState<LegalLang>('ru');
  const doc = content[lang];

  return (
    <div className={classes.page}>
      <div className={classes.card}>
        <header className={classes.header}>
          <div className={classes.topBar}>
            <Link to={backTo} className={classes.backLink}>
              <ArrowLeft size={18} strokeWidth={1.75} aria-hidden />
              {BACK_LABEL[lang]}
            </Link>
            <div className={classes.langSwitch} role="group" aria-label="Language">
              {(Object.keys(LANG_LABEL) as LegalLang[]).map(code => (
                <button
                  key={code}
                  type="button"
                  className={code === lang ? `${classes.langButton} ${classes.langButtonActive}` : classes.langButton}
                  aria-pressed={code === lang}
                  onClick={(): void => setLang(code)}
                >
                  {LANG_LABEL[code]}
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

        {doc.sections.map(section => (
          <section key={section.heading} className={classes.section}>
            <h3 className={classes.sectionHeading}>{section.heading}</h3>
            {section.blocks.map((block, index) =>
              block.type === 'p' ? (
                <p key={index} className={classes.paragraph}>
                  {block.text}
                </p>
              ) : (
                <ul key={index} className={classes.list}>
                  {block.items.map(item => (
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
