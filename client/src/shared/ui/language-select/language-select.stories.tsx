import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { FC, ReactElement, useState } from 'react';

import { Stack, withFrame } from 'storybook-dir/showcase';

import type { Language } from '@shared/lib';

import LanguageSelect from './language-select';

const meta: Meta<typeof LanguageSelect> = {
  title: 'Shared/LanguageSelect',
  component: LanguageSelect,
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'The one language control of the app (Settings, sign-in / register, legal pages): a `Select` listing ' +
          'every supported language, each named in itself and marked with that language (`lang`) for screen readers. `variant` is `field` for a settings row or `compact` (a globe and the language) for a footer or a page corner; `ariaLabel` is the translated accessible name; the app ' +
          'renders it through its data layer, which reads and changes the app language.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

type StatefulProps = { initialValue: Language; variant?: 'field' | 'compact' };

const StatefulLanguageSelect: FC<StatefulProps> = ({ initialValue, variant }) => {
  const [value, setValue] = useState<Language>(initialValue);

  return (
    <Stack>
      <LanguageSelect value={value} onChange={setValue} ariaLabel="Language" variant={variant} />
    </Stack>
  );
};

/** Closed, showing the current language. */
export const Default: Story = {
  render: (): ReactElement => <StatefulLanguageSelect initialValue="en" />,
};

/** Opened: every supported language, the current one highlighted. */
export const Open: Story = {
  render: (): ReactElement => <StatefulLanguageSelect initialValue="ru" />,
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button'));
  },
};

/** Compact: a globe and the language; its list opens where it fits. */
export const Compact: Story = {
  render: (): ReactElement => <StatefulLanguageSelect initialValue="en" variant="compact" />,
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button'));
  },
};
