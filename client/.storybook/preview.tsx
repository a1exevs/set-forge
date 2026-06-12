import { Controls, Description, Primary, Subtitle, Title } from '@storybook/blocks';
import type { Preview } from '@storybook/react';

import 'src/shared/ui/styles/global.scss';

const preview: Preview = {
  tags: ['autodocs'],
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
