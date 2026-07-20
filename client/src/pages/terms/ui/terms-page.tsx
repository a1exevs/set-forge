import { FC } from 'react';

import { LegalDocument } from '@shared';

import { TERMS_EFFECTIVE_DATE, termsContent } from 'src/pages/terms/model/terms-content';

const TermsPage: FC = () => <LegalDocument content={termsContent} effectiveDate={TERMS_EFFECTIVE_DATE} />;

export default TermsPage;
