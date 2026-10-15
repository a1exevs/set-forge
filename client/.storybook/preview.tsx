import { Controls, Description, Primary, Subtitle, Title } from '@storybook/blocks';
import type { Decorator, Preview } from '@storybook/react';
import { type FC, type PropsWithChildren, useLayoutEffect } from 'react';

import { dictionaries } from 'src/app/i18n/dictionaries';
import { initI18n, isLanguage, LANGUAGES, useLanguageStore } from 'src/shared/lib';

import 'src/app/styles/global.scss';

initI18n(dictionaries);

type LocaleSyncProps = PropsWithChildren<{ locale: unknown }>;

/** Puts the toolbar language into the app store before the paint, so every story renders in it. */
const LocaleSync: FC<LocaleSyncProps> = ({ locale, children }) => {
  useLayoutEffect(() => {
    if (isLanguage(locale) && useLanguageStore.getState().language !== locale) {
      useLanguageStore.getState().setLanguage(locale);
    }
  }, [locale]);

  return <>{children}</>;
};

const withLocale: Decorator = (Story, { globals }) => (
  <LocaleSync locale={globals.locale}>
    <Story />
  </LocaleSync>
);

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [withLocale],
  globalTypes: {
    locale: {
      description: 'Interface language',
      toolbar: {
        title: 'Language',
        icon: 'globe',
        items: LANGUAGES.map((language: (typeof LANGUAGES)[number]) => ({
          value: language.code,
          title: language.name,
        })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: 'en' },
  parameters: {
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['App', 'Pages', 'Widgets', 'Features', 'Entities', 'Shared'],
        locales: '',
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Controls />
          {/* <Stories /> */}
        </>
      ),
    },
  },
};

export default preview;
