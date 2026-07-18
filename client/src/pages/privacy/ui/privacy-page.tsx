import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { FC, useState } from 'react';

import { BrandWordmark } from '@shared';

import {
  PRIVACY_EFFECTIVE_DATE,
  privacyContent,
  type PrivacyLang,
} from 'src/pages/privacy/model/privacy-policy-content';
import classes from 'src/pages/privacy/ui/privacy-page.module.scss';

const LANG_LABEL: Record<PrivacyLang, string> = { ru: 'RU', en: 'EN' };
const BACK_LABEL: Record<PrivacyLang, string> = { ru: 'Назад', en: 'Back' };

const PrivacyPage: FC = () => {
  const [lang, setLang] = useState<PrivacyLang>('ru');
  const content = privacyContent[lang];

  return (
    <div className={classes.page}>
      <div className={classes.card}>
        <header className={classes.header}>
          <div className={classes.topBar}>
            <Link to="/login" className={classes.backLink}>
              <ArrowLeft size={18} strokeWidth={1.75} aria-hidden />
              {BACK_LABEL[lang]}
            </Link>
            <div className={classes.langSwitch} role="group" aria-label="Language">
              {(Object.keys(LANG_LABEL) as PrivacyLang[]).map(code => (
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
          <h2 className={classes.title}>{content.title}</h2>
          <p className={classes.effective}>
            {content.effectiveLabel}: {PRIVACY_EFFECTIVE_DATE}
          </p>
        </header>

        <p className={classes.intro}>{content.intro}</p>

        {content.sections.map(section => (
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

export default PrivacyPage;
