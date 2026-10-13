import { FC, useState } from 'react';

import { useProgress } from '@shared/lib';

import DocumentReconsentGate from './document-reconsent-gate';

type Props = {
  open: boolean;
  isError: boolean;
  /** Rejects on failure; the gate shows `isError`. */
  onAccept: () => Promise<void>;
  /** Never rejects. */
  onLogout: () => Promise<void>;
  onLeave: () => void;
};

const DocumentReconsentGateLogicLayer: FC<Props> = ({ open, isError, onAccept, onLogout, onLeave }) => {
  const [consent, setConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Accept and Log out both end the gate: one in flight locks the other.
  const { run, progressOf, busy } = useProgress<'accept' | 'logout'>();
  // An accepted gate closes by the data at once; it stays until the progress of its action has been held
  const gateOpen = open || busy;

  const handleAccept = (): void => {
    void run('accept', onAccept).catch((): void => undefined);
  };

  const handleLogout = async (): Promise<void> => {
    if (await run('logout', onLogout)) {
      onLeave();
    }
  };

  return (
    <DocumentReconsentGate
      open={gateOpen}
      busy={busy}
      isError={isError}
      consent={consent}
      termsAccepted={termsAccepted}
      acceptProgress={progressOf('accept')}
      logoutProgress={progressOf('logout')}
      onConsentChange={setConsent}
      onTermsChange={setTermsAccepted}
      onAccept={handleAccept}
      onLogout={(): void => void handleLogout()}
    />
  );
};

export default DocumentReconsentGateLogicLayer;
