import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { FC, Fragment } from 'react';

import type { Translate } from '@shared/lib';
import { BrandWordmark, LanguageSelect } from '@shared/ui';

import classes from './legal-document.module.scss';
import type { LegalBlock, LegalContent, LegalLink, LegalSection, LegalText } from '../model/legal-content';

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
  t: Translate;
  doc: LegalContent;
  effectiveDate: string;
  onBack: () => void;
};

const LegalDocument: FC<Props> = ({ t, doc, effectiveDate, onBack }) => {
  return (
    <div className={classes.page}>
      <div className={classes.card}>
        <header className={classes.header}>
          <div className={classes.topBar}>
            <button type="button" className={classes.backLink} onClick={onBack}>
              <ArrowLeft size={18} strokeWidth={1.75} aria-hidden />
              {t('common.back')}
            </button>
            <LanguageSelect variant="compact" ariaLabel={t('language.label')} />
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
