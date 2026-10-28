import { History, Home, User } from 'lucide-react';

import type { TabRoute } from '@shared/lib';
import type { TabsBarItem } from '@shared/ui';

export const MAIN_TAB_ROUTES: TabRoute[] = [
  { id: 'home', to: '/' },
  { id: 'history', to: '/history' },
  { id: 'profile', to: '/profile' },
];

/** The tabs without their labels: the presentation names them in the chosen language. */
export const MAIN_TAB_ITEMS = [
  { id: 'home', to: '/', icon: Home },
  { id: 'history', to: '/history', icon: History },
  { id: 'profile', to: '/profile', icon: User },
] as const satisfies readonly Omit<TabsBarItem, 'label'>[];

export type MainTabId = (typeof MAIN_TAB_ITEMS)[number]['id'];
