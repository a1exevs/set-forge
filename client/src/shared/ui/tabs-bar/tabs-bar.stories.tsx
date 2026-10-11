import type { Meta, StoryObj } from '@storybook/react';
import { Bell, Home, MessageCircle, MoreHorizontal, Play, User } from 'lucide-react';
import type { ReactElement } from 'react';

import { renderWithRouter } from 'storybook-dir/render-with-router';

import TabsBar, { type TabsBarItem } from './tabs-bar';

const TWO_TABS: TabsBarItem[] = [
  { id: 'home', label: 'Home', to: '/', icon: Home },
  { id: 'profile', label: 'Profile', to: '/profile', icon: User },
];

const FIVE_TABS: TabsBarItem[] = [
  { id: 'home', label: 'Home', to: '/', icon: Home },
  { id: 'video', label: 'Video', to: '/video', icon: Play },
  { id: 'messages', label: 'Messages', to: '/messages', icon: MessageCircle, badgeCount: 10 },
  { id: 'notifications', label: 'Notifications', to: '/notifications', icon: Bell, badgeCount: 140 },
  { id: 'more', label: 'More', to: '/more', icon: MoreHorizontal },
];

const meta = {
  title: 'Shared/TabsBar',
  component: TabsBar,
  args: { items: TWO_TABS, activeItemId: 'home' },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The bottom navigation bar: router `Link`s with an icon, a label and an optional badge. Fixed to the ' +
          'bottom edge; `activeItemId` marks the current tab.',
      },
    },
  },
  render: (args): ReactElement =>
    renderWithRouter({
      paths: args.items.map((item: TabsBarItem) => item.to),
      component: (): ReactElement => <TabsBar {...args} />,
    }),
} satisfies Meta<typeof TabsBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The app's two tabs, home active. */
export const Default: Story = {};

/** The second tab active. */
export const ProfileActive: Story = {
  args: { activeItemId: 'profile' },
};

/** Five tabs with badge counts: the widest bar the layout is designed for; counts above 99 are capped. */
export const FiveTabs: Story = {
  args: { items: FIVE_TABS },
};
