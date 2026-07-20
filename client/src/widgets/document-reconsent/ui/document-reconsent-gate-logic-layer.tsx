import { FC, useState } from 'react';

import DocumentReconsentGate from 'src/widgets/document-reconsent/ui/document-reconsent-gate';

type Props = {
  open: boolean;
  busy: boolean;
  isError: boolean;
  onAccept: () => void;
  onLogout: () => void;
};

const DocumentReconsentGateLogicLayer: FC<Props> = ({ open, busy, isError, onAccept, onLogout }) => {
  const [consent, setConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <DocumentReconsentGate
      open={open}
      busy={busy}
      isError={isError}
      consent={consent}
      termsAccepted={termsAccepted}
      onConsentChange={setConsent}
      onTermsChange={setTermsAccepted}
      onAccept={onAccept}
      onLogout={onLogout}
    />
  );
};

export default DocumentReconsentGateLogicLayer;
