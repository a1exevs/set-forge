import { useRouterState } from '@tanstack/react-router';
import { FC, useMemo } from 'react';

import { TabsBar } from '@shared/ui';

import { MAIN_TAB_ITEMS, MAIN_TAB_ROUTES } from '../config/main-tab-routes';

const MainTabsBar: FC = () => {
  const pathname = useRouterState({ select: state => state.location.pathname });

  const activeItemId = useMemo(() => MAIN_TAB_ROUTES.find(tab => tab.to === pathname)?.id ?? '', [pathname]);

  return <TabsBar items={MAIN_TAB_ITEMS} activeItemId={activeItemId} />;
};

export default MainTabsBar;
