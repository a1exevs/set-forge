import { useEffect, useRef, useState } from 'react';

import { PROGRESS_MIN_VISIBLE_MS, PROGRESS_SHOW_AFTER_MS } from './progress';

/** What a loading screen shows: nothing yet (`blank`), its skeleton, or its content. */
export type LoadingPhase = 'blank' | 'skeleton' | 'content';

/**
 * The timing of a skeleton: data that arrives within `PROGRESS_SHOW_AFTER_MS` shows with no skeleton; a skeleton,
 * once shown, stays `PROGRESS_MIN_VISIBLE_MS` even when the data comes sooner.
 */
export function useLoadingPhase(isLoading: boolean): LoadingPhase {
  const [shown, setShown] = useState<boolean>(false);
  const shownAtRef = useRef<number>(0);

  useEffect(() => {
    if (isLoading && !shown) {
      const showTimer = setTimeout((): void => {
        shownAtRef.current = Date.now();
        setShown(true);
      }, PROGRESS_SHOW_AFTER_MS);
      return (): void => clearTimeout(showTimer);
    }
    if (!isLoading && shown) {
      const remaining = Math.max(0, PROGRESS_MIN_VISIBLE_MS - (Date.now() - shownAtRef.current));
      const hideTimer = setTimeout((): void => setShown(false), remaining);
      return (): void => clearTimeout(hideTimer);
    }
    return undefined;
  }, [isLoading, shown]);

  if (shown) {
    return 'skeleton';
  }
  return isLoading ? 'blank' : 'content';
}
