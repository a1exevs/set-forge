import { FC } from 'react';

import { useLanguageStore } from '@shared/lib';

import LanguageSelect from './language-select';

type Props = {
  ariaLabel: string;
  variant?: 'field' | 'compact';
  className?: string;
};

/** Reads and changes the app language (the store is read here, not in the presentation). */
const LanguageSelectDataLayer: FC<Props> = props => {
  const language = useLanguageStore.use.language();
  const setLanguage = useLanguageStore.use.setLanguage();

  return <LanguageSelect {...props} value={language} onChange={setLanguage} />;
};

export default LanguageSelectDataLayer;
