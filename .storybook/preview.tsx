import { Controls, Description, Primary, Subtitle, Title } from '@storybook/blocks';
import type { Preview } from '@storybook/react';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';

import { routeTree } from 'src/route-tree.gen';
import 'src/app/styles/global.scss';

const withRouter: Preview['decorators'][0] = (Story: React.FC, context) => {
  const routerConfig = context.parameters.router as { initialEntries?: string[] } | undefined;

  if (!routerConfig?.initialEntries) {
    return <Story />;
  }

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: routerConfig.initialEntries }),
  });

  return <RouterProvider router={router} />;
};

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: {
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['App', 'Pages', 'Common'],
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
