import type { Meta } from '@storybook/react';
import type { ReactElement } from 'react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { renderWithRouter } from 'storybook-dir/render-with-router';

import LegalFooter from './legal-footer';

const meta = {
  title: 'Widgets/LegalFooter',
  component: LegalFooter,
} satisfies Meta<typeof LegalFooter>;

export default meta;

// LegalFooter renders TanStack Router <Link>s to the legal pages, so it needs a router.
const renderLegalFooter = (): ReactElement =>
  renderWithRouter({ paths: ['/privacy', '/terms'], component: (): ReactElement => <LegalFooter /> });

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderLegalFooter });
export const Desktop = buildDesktopStoryObj<typeof meta>({ render: renderLegalFooter });
export const Tablet = buildTabletStoryObj<typeof meta>({ render: renderLegalFooter });
export const Mobile = buildMobileStoryObj<typeof meta>({ render: renderLegalFooter });
