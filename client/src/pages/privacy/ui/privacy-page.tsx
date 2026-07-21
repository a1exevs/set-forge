import { FC } from 'react';

import { LegalDocument } from '@shared';

import { PRIVACY_EFFECTIVE_DATE, privacyContent } from 'src/pages/privacy/model/privacy-policy-content';

const PrivacyPage: FC = () => <LegalDocument content={privacyContent} effectiveDate={PRIVACY_EFFECTIVE_DATE} />;

export default PrivacyPage;
