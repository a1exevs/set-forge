import type { Dictionaries } from '@shared/lib';

import en from './en.json';
import ru from './ru.json';

// English is the reference: a key missing in another dictionary fails the build here.
const russian: typeof en = ru;

export const dictionaries: Dictionaries = {
  en: { translation: en },
  ru: { translation: russian },
};

// Types every `t('…')` key against the English dictionary: a key that does not exist fails `tsc`.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
  }
}
