import { useRouter } from '@tanstack/react-router';
import { FC } from 'react';

import { type Language, useT } from '@shared/lib';

import LegalDocument from './legal-document';
import type { LegalContent } from '../model/legal-content';

type Props = {
  content: Record<Language, LegalContent>;
  effectiveDate: string;
  backTo?: '/login' | '/register';
};

const LegalDocumentLogicLayer: FC<Props> = ({ content, effectiveDate, backTo = '/login' }) => {
  // The document follows the app language; its language control changes the whole app.
  const { t, language } = useT();
  const router = useRouter();

  // Return to wherever the user came from, falling back to `backTo` for direct
  // loads / new tabs where there is no in-app history to step back through.
  const handleBack = (): void => {
    if (router.history.canGoBack()) {
      router.history.back();
    } else {
      void router.navigate({ to: backTo });
    }
  };

  return <LegalDocument t={t} doc={content[language]} effectiveDate={effectiveDate} onBack={handleBack} />;
};

export default LegalDocumentLogicLayer;
