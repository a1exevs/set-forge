import { ChangeEvent, FC, FocusEvent, useEffect, useState } from 'react';

import NumericFieldView from 'src/shared/ui/numeric-field/numeric-field';

type Variant = 'integer' | 'decimal';

type Props = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  variant: Variant;
  error?: string;
  id?: string;
  disabled?: boolean;
  size?: 'md' | 'sm';
};

const parseDecimalDraft = (draft: string): number | null => {
  if (draft === '' || draft === '.') {
    return null;
  }
  const n = parseFloat(draft);
  if (Number.isNaN(n)) {
    return null;
  }
  return n;
};

const decimalDraftMatchesValue = (val: number | null, draft: string): boolean => {
  if (val === null) {
    return draft === '' || draft === '.';
  }
  const parsed = parseDecimalDraft(draft);
  if (parsed === null) {
    return false;
  }
  return parsed === val;
};

const sanitizeDecimalInput = (raw: string): string => {
  let next = raw.replace(/[^\d.]/g, '');
  const firstDot = next.indexOf('.');
  if (firstDot !== -1) {
    next = next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, '');
  }
  return next;
};

const sanitizeIntegerInput = (raw: string): string => {
  return raw.replace(/\D/g, '');
};

const initialDraft = (val: number | null, variant: Variant): string => {
  if (val === null || Number.isNaN(val)) {
    return '';
  }
  if (variant === 'integer') {
    return String(Math.trunc(val));
  }
  return String(val);
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
