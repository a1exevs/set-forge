import { Link } from '@tanstack/react-router';
import { ChangeEvent, FC } from 'react';

import { type Progress, Trans, type Translate } from '@shared/lib';
import { Button, Dialog } from '@shared/ui';

import classes from './document-reconsent-gate.module.scss';

type Props = {
  t: Translate;
  open: boolean;
  busy: boolean;
  isError: boolean;
  consent: boolean;
  termsAccepted: boolean;
  acceptProgress: Progress;
  logoutProgress: Progress;
  onConsentChange: (value: boolean) => void;
  onTermsChange: (value: boolean) => void;
  onAccept: () => void;
  onLogout: () => void;
};

const DocumentReconsentGate: FC<Props> = ({
  t,
  open,
  busy,
  isError,
  consent,
  termsAccepted,
  acceptProgress,
  logoutProgress,
  onConsentChange,
  onTermsChange,
  onAccept,
  onLogout,
}) => {
  return (
    <Dialog open={open} onClose={(): void => undefined} disableAnimation ariaLabel={t('reconsent.title')}>
      <div className={classes.content}>
        <h2 className={classes.title}>{t('reconsent.title')}</h2>
        <p className={classes.text}>{t('reconsent.text')}</p>

        <label className={classes.check}>
          {/** TODO implement shared chackbox via Headless UI and use it **/}
          <input
            type="checkbox"
            className={classes.checkbox}
            checked={consent}
            onChange={(e: ChangeEvent<HTMLInputElement>): void => onConsentChange(e.target.checked)}
            disabled={busy}
          />
          <span>
            <Trans
              t={t}
              i18nKey="consent.personalData"
              components={{
                policy: <Link to="/privacy" className={classes.link} target="_blank" rel="noopener noreferrer" />,
              }}
            />
          </span>
        </label>

        <label className={classes.check}>
          {/** TODO implement shared chackbox via Headless UI and use it **/}
          <input
            type="checkbox"
            className={classes.checkbox}
            checked={termsAccepted}
            onChange={(e: ChangeEvent<HTMLInputElement>): void => onTermsChange(e.target.checked)}
            disabled={busy}
          />
          <span>
            <Trans
              t={t}
              i18nKey="consent.terms"
              components={{
                terms: <Link to="/terms" className={classes.link} target="_blank" rel="noopener noreferrer" />,
              }}
            />
          </span>
        </label>

        {isError && <p className={classes.error}>{t('reconsent.error')}</p>}

        <div className={classes.actions}>
          <Button
            variant="secondary"
            progress={logoutProgress}
            onClick={(): void => onLogout()}
            className={classes.action}
          >
            {t('common.logOut')}
          </Button>
          <Button
            progress={acceptProgress}
            onClick={(): void => onAccept()}
            disabled={!consent || !termsAccepted}
            className={classes.action}
          >
            {t('reconsent.accept')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DocumentReconsentGate;
