import { FC } from 'react';

import { useT } from '@shared/lib';

import LegalFooter from './legal-footer';

type Props = {
  /** Optional extra class for page-specific outer spacing (the widget owns the inner styling). */
  className?: string;
};

const LegalFooterLogicLayer: FC<Props> = ({ className }) => {
  const { t } = useT();

  return <LegalFooter t={t} className={className} />;
};

export default LegalFooterLogicLayer;
