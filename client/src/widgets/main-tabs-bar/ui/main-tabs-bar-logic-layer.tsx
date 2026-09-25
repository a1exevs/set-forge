import { useRouterState } from '@tanstack/react-router';
import { FC, useMemo } from 'react';

import MainTabsBar from './main-tabs-bar';
import { getActiveMainTabId } from '../model/active-main-tab';

const MainTabsBarLogicLayer: FC = () => {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const activeItemId = useMemo(() => getActiveMainTabId(pathname), [pathname]);

  return <MainTabsBar activeItemId={activeItemId} />;
};

export default MainTabsBarLogicLayer;
