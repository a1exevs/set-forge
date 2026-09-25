import { FC } from 'react';

import { LegalDocument } from '@shared/ui';

import { TERMS_EFFECTIVE_DATE, termsContent } from '../config/terms-content';

const TermsPage: FC = () => <LegalDocument content={termsContent} effectiveDate={TERMS_EFFECTIVE_DATE} />;

export default TermsPage;
