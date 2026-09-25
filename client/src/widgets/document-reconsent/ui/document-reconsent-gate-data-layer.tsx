import { useRouterState } from '@tanstack/react-router';
import { FC } from 'react';

import { useAcceptDocumentsMutation, useCurrentUserQuery, useLogoutMutation } from '@entities/session';

import DocumentReconsentGateLogicLayer from './document-reconsent-gate-logic-layer';
import { LEGAL_DOCUMENT_PATHS } from '../config/legal-document-paths';

/**
 * Blocking gate shown when the signed-in user must (re-)accept the current legal documents
 * (see `documentsPendingAcceptance`). It cannot be dismissed — the user either accepts both
 * documents or logs out. Suppressed on `/privacy` and `/terms` so the documents themselves
 * remain readable. Renders nothing when acceptance is up to date.
 */
const DocumentReconsentGateDataLayer: FC = () => {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const { data: user } = useCurrentUserQuery(true);
  const acceptMutation = useAcceptDocumentsMutation();
  const logoutMutation = useLogoutMutation();

  const onLegalDocumentPage = LEGAL_DOCUMENT_PATHS.has(pathname);
  const open = Boolean(user?.documentsPendingAcceptance) && !onLegalDocumentPage;
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
