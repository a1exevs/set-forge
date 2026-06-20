import { useNavigate } from '@tanstack/react-router';
import { RefObject, useCallback } from 'react';

import { getAdjacentTabRoute } from 'src/shared/model/helpers/get-adjacent-tab-route';
import type { TabRoute } from 'src/shared/model/helpers/get-adjacent-tab-route';
import { useHorizontalSwipe } from 'src/shared/model/hooks/use-horizontal-swipe';

export type UseTabSwipeNavigationOptions = {
  tabs: TabRoute[];
  activePath: string;
};

export function useTabSwipeNavigation({ tabs, activePath }: UseTabSwipeNavigationOptions): RefObject<HTMLDivElement> {
  const navigate = useNavigate();

  const onSwipeLeft = useCallback((): void => {
    const nextTab = getAdjacentTabRoute(tabs, activePath, 'left');
    if (nextTab) {
      void navigate({ to: nextTab.to });
    }
  }, [tabs, activePath, navigate]);

  const onSwipeRight = useCallback((): void => {
    const previousTab = getAdjacentTabRoute(tabs, activePath, 'right');
    if (previousTab) {
      void navigate({ to: previousTab.to });
    }
  }, [tabs, activePath, navigate]);

  const hasNextTab = getAdjacentTabRoute(tabs, activePath, 'left') !== null;
  const hasPreviousTab = getAdjacentTabRoute(tabs, activePath, 'right') !== null;

  return useHorizontalSwipe({
    onSwipeLeft: hasNextTab ? onSwipeLeft : undefined,
    onSwipeRight: hasPreviousTab ? onSwipeRight : undefined,
  });
}
