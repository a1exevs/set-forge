import { FC } from 'react';

import { LegalDocument } from '@widgets/legal-document';

import { PRIVACY_EFFECTIVE_DATE, privacyContent } from '../config/privacy-policy-content';

const PrivacyPage: FC = () => <LegalDocument content={privacyContent} effectiveDate={PRIVACY_EFFECTIVE_DATE} />;

export default PrivacyPage;
