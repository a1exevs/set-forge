import { useRouterState } from '@tanstack/react-router';
import { History, Home, User } from 'lucide-react';
import { FC, useMemo } from 'react';

import { TabsBar } from '@shared';

import type { TabsBarItem } from 'src/shared/ui/tabs-bar/tabs-bar';
import { MAIN_TAB_ROUTES } from 'src/widgets/main-tabs-bar/model/main-tab-routes';

const MAIN_TAB_ITEMS: TabsBarItem[] = [
  { id: 'home', label: 'Home', to: '/', icon: Home },
  { id: 'history', label: 'History', to: '/history', icon: History },
  { id: 'profile', label: 'Profile', to: '/profile', icon: User },
];

const MainTabsBar: FC = () => {
  const pathname = useRouterState({ select: state => state.location.pathname });

  const activeItemId = useMemo(() => MAIN_TAB_ROUTES.find(tab => tab.to === pathname)?.id ?? '', [pathname]);

  return <TabsBar items={MAIN_TAB_ITEMS} activeItemId={activeItemId} />;
};

export default MainTabsBar;
