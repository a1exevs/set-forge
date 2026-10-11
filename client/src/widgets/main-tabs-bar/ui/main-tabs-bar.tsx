import { FC } from 'react';

import { TabsBar } from '@shared/ui';

import { MAIN_TAB_ITEMS } from '../config/main-tab-routes';

type Props = {
  activeItemId: string;
};

const MainTabsBar: FC<Props> = ({ activeItemId }) => <TabsBar items={MAIN_TAB_ITEMS} activeItemId={activeItemId} />;

export default MainTabsBar;
