/** Draft-string handling for numeric inputs: sanitizing keystrokes and syncing the draft with the value. */
export type NumericVariant = 'integer' | 'decimal';

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

export const decimalDraftMatchesValue = (val: number | null, draft: string): boolean => {
  if (val === null) {
    return draft === '' || draft === '.';
  }
  const parsed = parseDecimalDraft(draft);
  if (parsed === null) {
    return false;
  }
  return parsed === val;
};

export const sanitizeDecimalInput = (raw: string): string => {
  let next = raw.replace(/[^\d.]/g, '');
  const firstDot = next.indexOf('.');
  if (firstDot !== -1) {
    next = next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, '');
  }
  return next;
};

export const sanitizeIntegerInput = (raw: string): string => {
  return raw.replace(/\D/g, '');
};

export const initialDraft = (val: number | null, variant: NumericVariant): string => {
  if (val === null || Number.isNaN(val)) {
    return '';
  }
  if (variant === 'integer') {
    return String(Math.trunc(val));
  }
  return String(val);
};
