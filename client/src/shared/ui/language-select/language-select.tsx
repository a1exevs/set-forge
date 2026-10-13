import { Globe } from 'lucide-react';
import { FC } from 'react';

import { isLanguage, type Language, LANGUAGES } from '@shared/lib';

import Select from '../select/select';

type Props = {
  value: Language;
  onChange: (language: Language) => void;
  /** The control's accessible name, translated by the caller. */
  ariaLabel: string;
  /** `field` for a settings row; `compact` (a globe and the language) for a footer or a page corner. */
  variant?: 'field' | 'compact';
  className?: string;
};

/** One control for every place with a language choice: lists every supported language, each named in itself. */
const LanguageSelect: FC<Props> = ({ value, onChange, ariaLabel, variant = 'field', className }) => (
  <Select
    value={value}
    // Each name is in its own language, so it carries that language for screen readers.
    options={LANGUAGES.map((language: (typeof LANGUAGES)[number]) => ({
      value: language.code,
      label: language.name,
      lang: language.code,
    }))}
    onChange={(next: string): void => {
      if (isLanguage(next)) {
        onChange(next);
      }
    }}
    ariaLabel={ariaLabel}
    appearance={variant}
    icon={variant === 'compact' ? <Globe size={16} strokeWidth={1.75} aria-hidden /> : undefined}
    className={className}
  />
);

export default LanguageSelect;
