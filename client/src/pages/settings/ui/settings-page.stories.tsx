import type { Meta } from '@storybook/react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { renderWithPageRouter } from 'storybook-dir/render-with-page-router';

import SettingsPageLogicLayer from './settings-page-logic-layer';

const renderSettingsPage = (): ReturnType<typeof renderWithPageRouter> =>
  renderWithPageRouter({
    initialEntries: ['/settings'],
    component: (): JSX.Element => <SettingsPageLogicLayer />,
  });

const meta = {
  title: 'Pages/SettingsPage',
  component: SettingsPageLogicLayer,
} satisfies Meta<typeof SettingsPageLogicLayer>;

export default meta;

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderSettingsPage });
export const Desktop = buildDesktopStoryObj<typeof meta>({ render: renderSettingsPage });
export const Tablet = buildTabletStoryObj<typeof meta>({ render: renderSettingsPage });
export const Mobile = buildMobileStoryObj<typeof meta>({ render: renderSettingsPage });
