import type { Language } from './languages';

const DAY_AND_MONTH: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

// Building an Intl formatter is costly and lists render many dates: one per language and options.
const dateFormats = new Map<string, Intl.DateTimeFormat>();

/** A date in the order and month names of the interface language (`Oct 19` / `19 окт.`). */
export const formatDate = (
  iso: string,
  language: Language,
  options: Intl.DateTimeFormatOptions = DAY_AND_MONTH,
): string => {
  const key = `${language}|${JSON.stringify(options)}`;
  let format = dateFormats.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(language, options);
    dateFormats.set(key, format);
  }
  const date = new Date(iso);
  // Intl throws on an invalid date: one bad timestamp must not take the whole screen down
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return format.format(date);
};
