import { Link } from '@tanstack/react-router';
import { FC } from 'react';

import classes from 'src/widgets/legal-footer/ui/legal-footer.module.scss';

type Props = {
  /** Optional extra class for page-specific outer spacing (the widget owns the inner styling). */
  className?: string;
};

const LegalFooter: FC<Props> = ({ className }) => {
  return (
    <footer className={className ? `${classes.legal} ${className}` : classes.legal}>
      <Link to="/privacy" className={classes.legalLink}>
        Privacy Policy
      </Link>
      <span className={classes.legalSep} aria-hidden>
        ·
      </span>
      <Link to="/terms" className={classes.legalLink}>
        Terms of Service
      </Link>
    </footer>
  );
};

export default LegalFooter;
