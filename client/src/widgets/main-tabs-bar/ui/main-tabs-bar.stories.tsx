import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';

import { renderWithRouter } from 'storybook-dir/render-with-router';

import MainTabsBar from './main-tabs-bar-logic-layer';

const MAIN_TAB_PATHS = ['/', '/history', '/profile'];

const renderMainTabsBar = (initialEntry: string): ReactElement =>
  renderWithRouter({
    initialEntry,
    paths: MAIN_TAB_PATHS,
    component: (): ReactElement => <MainTabsBar />,
  });

const meta = {
  title: 'Widgets/MainTabsBar',
  component: MainTabsBar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MainTabsBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The bar reads the active tab from the router: home. */
export const HomeActive: Story = {
  render: (): ReactElement => renderMainTabsBar('/'),
};

export const HistoryActive: Story = {
  render: (): ReactElement => renderMainTabsBar('/history'),
};

export const ProfileActive: Story = {
  render: (): ReactElement => renderMainTabsBar('/profile'),
};
