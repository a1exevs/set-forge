import { useRouter } from '@tanstack/react-router';
import { FC, useState } from 'react';

import type { LegalLang } from '@shared/config';

import LegalDocument, { type LegalContent } from './legal-document';

type Props = {
  content: Record<LegalLang, LegalContent>;
  effectiveDate: string;
  backTo?: '/login' | '/register';
};

const LegalDocumentLogicLayer: FC<Props> = ({ content, effectiveDate, backTo = '/login' }) => {
  const [lang, setLang] = useState<LegalLang>('ru');
  const router = useRouter();

  // Return to wherever the user came from (e.g. Profile), falling back to `backTo` for direct
  // loads / new tabs where there is no in-app history to step back through.
  const handleBack = (): void => {
    if (router.history.canGoBack()) {
      router.history.back();
    } else {
      void router.navigate({ to: backTo });
    }
  };

  return (
    <LegalDocument
      doc={content[lang]}
      lang={lang}
      effectiveDate={effectiveDate}
      onLangChange={setLang}
      onBack={handleBack}
    />
  );
};

export default LegalDocumentLogicLayer;
