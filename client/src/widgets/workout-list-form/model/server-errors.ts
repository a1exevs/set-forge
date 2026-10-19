import { apiErrorTexts } from '@shared/api';
import type { Translate } from '@shared/lib';

/** The request paths the form shows an error under: the list fields and every field of an exercise by its position. */
const FORM_FIELD = /^(name|description|exercises\.\d+\.(name|muscleGroup|weight|reps|sets))$/;

export type FormServerErrors = {
  /** Texts for the fields of the form, by request path (`exercises.0.sets`). */
  fields: Record<string, string>;
  /** Everything the form has no field for: errors without a field, or for a field it does not show. */
  others: string[];
};

/** The errors of a failed save, split into what the form shows under its fields and what the page shows itself. */
export const formServerErrors = (error: unknown, t: Translate): FormServerErrors => {
  const { byField, general } = apiErrorTexts(error, t);
  const errors: FormServerErrors = { fields: {}, others: [...general] };
  for (const [field, text] of Object.entries(byField)) {
    if (FORM_FIELD.test(field)) {
      errors.fields[field] = text;
    } else {
      errors.others.push(text);
    }
  }
  return errors;
};
