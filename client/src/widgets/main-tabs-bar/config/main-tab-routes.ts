import { History, Home, User } from 'lucide-react';

import type { TabRoute } from '@shared/lib';
import type { TabsBarItem } from '@shared/ui';

export const MAIN_TAB_ROUTES: TabRoute[] = [
  { id: 'home', to: '/' },
  { id: 'history', to: '/history' },
  { id: 'profile', to: '/profile' },
];

export const MAIN_TAB_ITEMS: TabsBarItem[] = [
  { id: 'home', label: 'Home', to: '/', icon: Home },
  { id: 'history', label: 'History', to: '/history', icon: History },
  { id: 'profile', label: 'Profile', to: '/profile', icon: User },
];
