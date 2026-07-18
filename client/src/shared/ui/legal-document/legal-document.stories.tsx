import type { LegalContent, LegalLang } from '@shared';
import type { Meta } from '@storybook/react';
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';

import LegalDocument from 'src/shared/ui/legal-document/legal-document';

const storyTitle = 'Shared/LegalDocument';

const meta = {
  title: storyTitle,
  component: LegalDocument,
} satisfies Meta<typeof LegalDocument>;

export default meta;

const sampleContent: Record<LegalLang, LegalContent> = {
  ru: {
    title: 'Политика обработки персональных данных',
    effectiveLabel: 'Действует с',
    intro: 'Пример вводного абзаца документа для витрины Storybook.',
    sections: [
      {
        heading: '1. Какие данные мы обрабатываем',
        blocks: [
          { type: 'p', text: 'Сервис обрабатывает минимально необходимый набор данных:' },
          { type: 'ul', items: ['адрес электронной почты;', 'пароль в виде хеша;', 'данные о тренировках.'] },
          {
            type: 'p',
            text: ['Использование Сервиса регулируется ', { text: 'Пользовательским соглашением', to: '/terms' }, '.'],
          },
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    effectiveLabel: 'Effective from',
    intro: 'A sample intro paragraph for the Storybook showcase.',
    sections: [
      {
        heading: '1. What data we process',
        blocks: [
          { type: 'p', text: 'The Service processes the minimum data necessary:' },
          { type: 'ul', items: ['email address;', 'password as a hash;', 'workout data.'] },
          { type: 'p', text: ['Use of the Service is governed by the ', { text: 'Terms of Use', to: '/terms' }, '.'] },
        ],
      },
    ],
  },
};

const renderLegalDocument = (): ReactElement => {
  const rootRoute = createRootRoute({
    component: (): ReactElement => <LegalDocument content={sampleContent} effectiveDate="2026-07-18" />,
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return <RouterProvider router={router} />;
};

export const Desktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderLegalDocument });
export const Desktop = buildDesktopStoryObj<typeof meta>({ render: renderLegalDocument });
export const Tablet = buildTabletStoryObj<typeof meta>({ render: renderLegalDocument });
export const Mobile = buildMobileStoryObj<typeof meta>({ render: renderLegalDocument });
