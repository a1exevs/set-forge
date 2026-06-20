import type { Meta } from '@storybook/react';
import { fn } from '@storybook/test';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { renderWithPageRouter } from 'storybook-dir/render-with-page-router';

import ProfilePageLogicLayer from 'src/pages/profile/ui/profile-page-logic-layer';

const storyTitle = 'Pages/ProfilePage';

const renderProfilePage = (): ReturnType<typeof renderWithPageRouter> =>
  renderWithPageRouter({
    initialEntries: ['/profile'],
    component: (): JSX.Element => (
      <ProfilePageLogicLayer email="jane@example.com" avatarLetter="J" onLogout={fn()} isLoggingOut={false} />
    ),
  });

const meta = {
  title: storyTitle,
  component: ProfilePageLogicLayer,
} satisfies Meta<typeof ProfilePageLogicLayer>;

export default meta;

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderProfilePage });
export const Desktop = buildDesktopStoryObj<typeof meta>({ render: renderProfilePage });
export const Tablet = buildTabletStoryObj<typeof meta>({ render: renderProfilePage });
export const Mobile = buildMobileStoryObj<typeof meta>({ render: renderProfilePage });
