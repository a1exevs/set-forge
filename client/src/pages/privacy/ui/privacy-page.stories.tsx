import type { Meta } from '@storybook/react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { renderWithPageRouter } from 'storybook-dir/render-with-page-router';

import PrivacyPage from 'src/pages/privacy/ui/privacy-page';

const storyTitle = 'Pages/PrivacyPage';

const renderPrivacyPage = (): ReturnType<typeof renderWithPageRouter> =>
  renderWithPageRouter({
    initialEntries: ['/privacy'],
    component: (): JSX.Element => <PrivacyPage />,
  });

const meta = {
  title: storyTitle,
  component: PrivacyPage,
} satisfies Meta<typeof PrivacyPage>;

export default meta;

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderPrivacyPage });
export const Desktop = buildDesktopStoryObj<typeof meta>({ render: renderPrivacyPage });
export const Tablet = buildTabletStoryObj<typeof meta>({ render: renderPrivacyPage });
export const Mobile = buildMobileStoryObj<typeof meta>({ render: renderPrivacyPage });
