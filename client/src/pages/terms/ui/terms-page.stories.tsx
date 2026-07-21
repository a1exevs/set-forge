import type { Meta } from '@storybook/react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { renderWithPageRouter } from 'storybook-dir/render-with-page-router';

import TermsPage from 'src/pages/terms/ui/terms-page';

const storyTitle = 'Pages/TermsPage';

const renderTermsPage = (): ReturnType<typeof renderWithPageRouter> =>
  renderWithPageRouter({
    initialEntries: ['/terms'],
    component: (): JSX.Element => <TermsPage />,
  });

const meta = {
  title: storyTitle,
  component: TermsPage,
} satisfies Meta<typeof TermsPage>;

export default meta;

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderTermsPage });
export const Desktop = buildDesktopStoryObj<typeof meta>({ render: renderTermsPage });
export const Tablet = buildTabletStoryObj<typeof meta>({ render: renderTermsPage });
export const Mobile = buildMobileStoryObj<typeof meta>({ render: renderTermsPage });
