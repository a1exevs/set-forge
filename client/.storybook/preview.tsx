import { Controls, Description, Primary, Subtitle, Title } from '@storybook/blocks';
import type { Preview } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';

import { ConfirmDialogProvider } from '@shared';

import { routeTree } from 'src/route-tree.gen';

import 'src/shared/ui/styles/global.scss';

const withRouterAndProviders: Preview['decorators'][0] = (Story: React.FC, context) => {
  const routerConfig = context.parameters.router as { initialEntries?: string[] } | undefined;
  const seedEditStorage = context.parameters.seedEditStorage;

  if (Array.isArray(seedEditStorage)) {
    localStorage.setItem('workout-lists', JSON.stringify(seedEditStorage));
  } else {
    localStorage.removeItem('workout-lists');
  }

  if (!routerConfig?.initialEntries) {
    return <Story />;
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: routerConfig.initialEntries }),
    defaultPreload: 'intent',
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmDialogProvider>
        <RouterProvider router={router} context={{ queryClient }} />
      </ConfirmDialogProvider>
    </QueryClientProvider>
  );
};

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [withRouterAndProviders],
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
