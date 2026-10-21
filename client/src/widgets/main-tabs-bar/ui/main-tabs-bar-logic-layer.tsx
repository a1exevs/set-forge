import { useRouterState } from '@tanstack/react-router';
import { FC, useMemo } from 'react';

import { useT } from '@shared/lib';

import MainTabsBar from './main-tabs-bar';
import { getActiveMainTabId } from '../model/active-main-tab';

const MainTabsBarLogicLayer: FC = () => {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const activeItemId = useMemo(() => getActiveMainTabId(pathname), [pathname]);
  const { t } = useT();

  return <MainTabsBar activeItemId={activeItemId} t={t} />;
};

export default MainTabsBarLogicLayer;
