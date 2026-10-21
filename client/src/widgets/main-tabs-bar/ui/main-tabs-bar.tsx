import { FC } from 'react';

import type { Translate } from '@shared/lib';
import { TabsBar, type TabsBarItem } from '@shared/ui';

import { MAIN_TAB_ITEMS, type MainTabId } from '../config/main-tab-routes';

type Props = {
  activeItemId: string;
  t: Translate;
};

const MainTabsBar: FC<Props> = ({ activeItemId, t }) => {
  // Static keys: the dictionary checks read them from the code
  const labels: Record<MainTabId, string> = {
    home: t('mainTabs.home'),
    history: t('mainTabs.history'),
    profile: t('mainTabs.profile'),
  };
  const items: TabsBarItem[] = MAIN_TAB_ITEMS.map(item => ({ ...item, label: labels[item.id] }));

  return <TabsBar items={items} activeItemId={activeItemId} ariaLabel={t('mainTabs.navigation')} />;
};

export default MainTabsBar;
