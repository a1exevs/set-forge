import { FC } from 'react';

import { useAcceptDocumentsMutation, useCurrentUserQuery, useLogoutMutation } from '@entities';

import DocumentReconsentGateLogicLayer from 'src/widgets/document-reconsent/ui/document-reconsent-gate-logic-layer';

/**
 * Blocking gate shown when the signed-in user must (re-)accept the current legal documents
 * (see `documentsPendingAcceptance`). It cannot be dismissed — the user either accepts both
 * documents or logs out. Renders nothing when acceptance is up to date.
 */
const DocumentReconsentGateDataLayer: FC = () => {
  const { data: user } = useCurrentUserQuery(true);
  const acceptMutation = useAcceptDocumentsMutation();
  const logoutMutation = useLogoutMutation();

  const open = Boolean(user?.documentsPendingAcceptance);
  const busy = acceptMutation.isPending || logoutMutation.isPending;

  return (
    <DocumentReconsentGateLogicLayer
      open={open}
      busy={busy}
      isError={acceptMutation.isError}
      onAccept={(): void => void acceptMutation.mutateAsync().catch(() => undefined)}
      onLogout={(): void => logoutMutation.mutate()}
    />
  );
};

export default DocumentReconsentGateDataLayer;
