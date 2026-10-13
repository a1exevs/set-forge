import type { FC } from 'react';

import { type Translate, useT } from '@shared/lib';

/**
 * A presentation that takes `t` as a story component: the wrapper passes the `t` of the current language (the
 * toolbar's), so its args stay the presentation's own props without `t`.
 */
export function withTranslate<P extends { t: Translate }>(Component: FC<P>): FC<Omit<P, 't'>> {
  const Translated: FC<Omit<P, 't'>> = props => {
    const { t } = useT();
    return <Component {...(props as P)} t={t} />;
  };
  Translated.displayName = Component.displayName ?? Component.name;
  return Translated;
}
