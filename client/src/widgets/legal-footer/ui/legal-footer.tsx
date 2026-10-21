import { Link } from '@tanstack/react-router';
import { FC } from 'react';

import type { Translate } from '@shared/lib';

import classes from './legal-footer.module.scss';

type Props = {
  t: Translate;
  /** Optional extra class for page-specific outer spacing (the widget owns the inner styling). */
  className?: string;
};

const LegalFooter: FC<Props> = ({ t, className }) => {
  return (
    <footer className={className ? `${classes.legal} ${className}` : classes.legal}>
      <Link to="/privacy" className={classes.legalLink}>
        {t('legal.privacyPolicy')}
      </Link>
      <span className={classes.legalSep} aria-hidden>
        ·
      </span>
      <Link to="/terms" className={classes.legalLink}>
        {t('legal.termsOfUse')}
      </Link>
    </footer>
  );
};

export default LegalFooter;
