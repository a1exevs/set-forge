import { ArrowLeft } from 'lucide-react';
import { FC } from 'react';

import type { Translate } from '@shared/lib';
import { BrandWordmark, LanguageSelect } from '@shared/ui';

import classes from './settings-page.module.scss';

type Props = {
  t: Translate;
  onBack: () => void;
};

const SettingsPage: FC<Props> = ({ t, onBack }) => {
  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <button type="button" className={classes.backButton} onClick={(): void => onBack()}>
          <ArrowLeft size={18} strokeWidth={1.75} aria-hidden />
          {t('common.back')}
        </button>
        <BrandWordmark title={t('settings.title')} titleAs="h1" />
      </header>

      <main className={classes.main}>
        <section className={classes.row}>
          {/* The select names itself for screen readers; this label is for the eye only. */}
          <span className={classes.rowLabel} aria-hidden>
            {t('language.label')}
          </span>
          <LanguageSelect ariaLabel={t('language.label')} className={classes.rowControl} />
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
