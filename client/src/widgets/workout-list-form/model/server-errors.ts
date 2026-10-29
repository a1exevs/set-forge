import { apiErrorTexts } from '@shared/api';
import type { Translate } from '@shared/lib';

import { isFormFieldPath } from './form-fields';

export type FormServerErrors = {
  /** Texts for the fields of the form, by request path (`exercises.0.sets`). */
  fields: Record<string, string>;
  /** Everything the form has no field for: errors without a field, or for a field it does not show. */
  others: string[];
};

/** The errors of a failed save, split into those the form shows under its fields and the rest. */
export const formServerErrors = (error: unknown, t: Translate): FormServerErrors => {
  const { byField, general } = apiErrorTexts(error, t);
  const errors: FormServerErrors = { fields: {}, others: [...general] };
  for (const [field, text] of Object.entries(byField)) {
    if (isFormFieldPath(field)) {
      errors.fields[field] = text;
    } else {
      errors.others.push(text);
    }
  }
  return errors;
};
