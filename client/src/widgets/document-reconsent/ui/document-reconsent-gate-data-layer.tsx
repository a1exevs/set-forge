import { useRouterState } from '@tanstack/react-router';
import { FC } from 'react';

import { useAcceptDocumentsMutation, useCurrentUserQuery } from '@entities/session';
import { useLogout } from '@features/logout';

import DocumentReconsentGateLogicLayer from './document-reconsent-gate-logic-layer';
import { LEGAL_DOCUMENT_PATHS } from '../config/legal-document-paths';

/**
 * The gate a signed-in user cannot dismiss while documents await acceptance (session/reconsent-gate); nothing
 * when acceptance is up to date.
 */
const DocumentReconsentGateDataLayer: FC = () => {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const { data: user } = useCurrentUserQuery(true);
  const acceptMutation = useAcceptDocumentsMutation();
  const { logout, leave } = useLogout();

  const onLegalDocumentPage = LEGAL_DOCUMENT_PATHS.has(pathname);
  const open = Boolean(user?.documentsPendingAcceptance) && !onLegalDocumentPage;

  return (
    <DocumentReconsentGateLogicLayer
      open={open}
      isError={acceptMutation.isError}
      onAccept={async (): Promise<void> => {
        await acceptMutation.mutateAsync();
      }}
      onLogout={logout}
      onLeave={leave}
    />
  );
};

export default DocumentReconsentGateDataLayer;
