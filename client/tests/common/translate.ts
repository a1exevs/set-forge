import i18next from 'i18next';

import type { Translate } from 'src/shared/lib/i18n/use-t';

/** The English translate function, for presentation tests that render without a logic layer. */
export const t: Translate = i18next.getFixedT('en');

/** The Russian translate function, for a pure function that takes `t` and has to show both languages. */
export const tRu: Translate = i18next.getFixedT('ru');
