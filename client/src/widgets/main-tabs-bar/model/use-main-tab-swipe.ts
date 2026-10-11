import { useRouterState } from '@tanstack/react-router';
import { RefObject } from 'react';

import { useTabSwipeNavigation } from '@shared/lib';

import { MAIN_TAB_ROUTES } from '../config/main-tab-routes';

/** Horizontal swipe between the main tabs (Home ↔ History ↔ Profile); attach the ref to the page container. */
export function useMainTabSwipe(): RefObject<HTMLDivElement> {
  const pathname = useRouterState({ select: state => state.location.pathname });
  return useTabSwipeNavigation({ tabs: MAIN_TAB_ROUTES, activePath: pathname });
}
