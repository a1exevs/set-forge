import { ChangeEvent, FC, FocusEvent, useEffect, useState } from 'react';

import {
  decimalDraftMatchesValue,
  initialDraft,
  type NumericVariant,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
} from '@shared/lib';

import NumericFieldView from './numeric-field';

type Props = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  variant: NumericVariant;
  error?: string;
  id?: string;
  disabled?: boolean;
  size?: 'md' | 'sm';
};

const NumericField: FC<Props> = ({ label, value, onChange, variant, error, id, disabled = false, size = 'md' }) => {
  const [draft, setDraft] = useState<string>(() => initialDraft(value, variant));

  useEffect((): void => {
    if (variant === 'integer') {
      setDraft(initialDraft(value, variant));
      return;
    }
    setDraft(prev => {
      if (decimalDraftMatchesValue(value, prev)) {
        return prev;
      }
      return initialDraft(value, variant);
    });
  }, [value, variant]);

  const handleInputFocus = (e: FocusEvent<HTMLInputElement>): void => {
    e.currentTarget.select();
  };

  const handleIntegerChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const cleaned = sanitizeIntegerInput(e.target.value);
    setDraft(cleaned);
    if (cleaned === '') {
      onChange(null);
      return;
    }
    const n = parseInt(cleaned, 10);
    if (!Number.isNaN(n)) {
      onChange(n);
    }
  };

  const handleDecimalChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const next = sanitizeDecimalInput(e.target.value);
    setDraft(next);
    if (next === '' || next === '.') {
      onChange(null);
      return;
    }
    const n = parseFloat(next);
    if (!Number.isNaN(n)) {
      onChange(n);
    }
  };

  return (
    <NumericFieldView
      label={label}
      id={id}
      disabled={disabled}
      error={error}
      inputMode={variant === 'decimal' ? 'decimal' : 'numeric'}
      inputValue={draft}
      onInputChange={variant === 'integer' ? handleIntegerChange : handleDecimalChange}
      onInputFocus={handleInputFocus}
      size={size}
    />
  );
};

export default NumericField;
