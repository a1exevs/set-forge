import { Link } from '@tanstack/react-router';
import { ChangeEvent, FC } from 'react';

import type { Progress } from '@shared/lib';
import { Button, Dialog } from '@shared/ui';

import classes from './document-reconsent-gate.module.scss';

type Props = {
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
    <Dialog open={open} onClose={(): void => undefined} disableAnimation ariaLabel="Updated documents">
      <div className={classes.content}>
        <h2 className={classes.title}>We’ve updated our documents</h2>
        <p className={classes.text}>Please review and accept the updated documents to keep using Set Forge.</p>

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
            I consent to the processing of my personal data as described in the{' '}
            <Link to="/privacy" className={classes.link} target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </Link>
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
            I accept the{' '}
            <Link to="/terms" className={classes.link} target="_blank" rel="noopener noreferrer">
              Terms of Use
            </Link>
          </span>
        </label>

        {isError && <p className={classes.error}>Something went wrong. Please try again.</p>}

        <div className={classes.actions}>
          <Button
            variant="secondary"
            progress={logoutProgress}
            onClick={(): void => onLogout()}
            className={classes.action}
          >
            Log out
          </Button>
          <Button
            progress={acceptProgress}
            onClick={(): void => onAccept()}
            disabled={!consent || !termsAccepted}
            className={classes.action}
          >
            Accept
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DocumentReconsentGate;
