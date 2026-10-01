import type { Meta, StoryObj } from '@storybook/react';
import { FC, ReactElement, useState } from 'react';

import { Caption, Row, Stack, withFrame } from 'storybook-dir/showcase';

import Transition from './transition';
import classes from './transition.stories.module.scss';
import Button from '../button/button';

const meta: Meta<typeof Transition> = {
  title: 'Shared/Transition',
  component: Transition,
  decorators: [withFrame],
  parameters: {
    docs: {
      description: {
        component:
          'A class-based enter / leave transition (Headless UI): `show` mounts or unmounts the child, the `enter*` ' +
          'and `leave*` classes are applied while it moves. The classes come from the caller’s stylesheet.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

type DemoProps = { initiallyShown: boolean };

const TransitionDemo: FC<DemoProps> = ({ initiallyShown }) => {
  const [show, setShow] = useState(initiallyShown);

  return (
    <Stack>
      <Row>
        <Button variant="secondary" onClick={(): void => setShow(v => !v)}>
          {show ? 'Hide' : 'Show'}
        </Button>
      </Row>
      <Transition
        show={show}
        enter={classes.fade}
        enterFrom={classes.hidden}
        enterTo={classes.visible}
        leave={classes.fade}
        leaveFrom={classes.visible}
        leaveTo={classes.hidden}
      >
        <div className={classes.box}>
          <Caption>Fades in and out over 300 ms.</Caption>
        </div>
      </Transition>
    </Stack>
  );
};

/** Shown: the child in place. */
export const Default: Story = {
  render: (): ReactElement => <TransitionDemo initiallyShown />,
};

/** Hidden: nothing is rendered; press Show to watch it enter. */
export const Hidden: Story = {
  render: (): ReactElement => <TransitionDemo initiallyShown={false} />,
};
