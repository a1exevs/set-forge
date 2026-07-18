import { Link } from '@tanstack/react-router';
import { FC, useState } from 'react';

import { useAcceptDocumentsMutation, useCurrentUserQuery, useLogoutMutation } from '@entities';
import { Button } from '@shared';

import Dialog from 'src/shared/ui/dialog/dialog';
import classes from 'src/widgets/document-reconsent/ui/document-reconsent-gate.module.scss';

/**
 * Blocking gate shown when the signed-in user must (re-)accept the current legal documents
 * (see `documentsPendingAcceptance`). It cannot be dismissed — the user either accepts both
 * documents or logs out. Renders nothing when acceptance is up to date.
 */
const DocumentReconsentGate: FC = () => {
  const { data: user } = useCurrentUserQuery(true);
  const acceptMutation = useAcceptDocumentsMutation();
  const logoutMutation = useLogoutMutation();

  const [consent, setConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const open = Boolean(user?.documentsPendingAcceptance);
  const busy = acceptMutation.isPending || logoutMutation.isPending;

  return (
    <Dialog open={open} onClose={(): void => undefined} disableAnimation ariaLabel="Updated documents">
      <div className={classes.content}>
        <h2 className={classes.title}>We’ve updated our documents</h2>
        <p className={classes.text}>Please review and accept the updated documents to keep using Set Forge.</p>

        <label className={classes.check}>
          <input
            type="checkbox"
            className={classes.checkbox}
            checked={consent}
            onChange={(e): void => setConsent(e.target.checked)}
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
          <input
            type="checkbox"
            className={classes.checkbox}
            checked={termsAccepted}
            onChange={(e): void => setTermsAccepted(e.target.checked)}
            disabled={busy}
          />
          <span>
            I accept the{' '}
            <Link to="/terms" className={classes.link} target="_blank" rel="noopener noreferrer">
              Terms of Use
            </Link>
          </span>
        </label>

        {acceptMutation.isError && <p className={classes.error}>Something went wrong. Please try again.</p>}

        <div className={classes.actions}>
          <Button
            variant="secondary"
            onClick={(): void => logoutMutation.mutate()}
            disabled={busy}
            className={classes.action}
          >
            Log out
          </Button>
          <Button
            onClick={(): void => void acceptMutation.mutateAsync().catch(() => undefined)}
            disabled={busy || !consent || !termsAccepted}
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
