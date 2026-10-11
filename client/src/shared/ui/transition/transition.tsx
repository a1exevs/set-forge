import { Transition as HeadlessTransition } from '@headlessui/react';
import { FC, PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  show: boolean;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
}>;

/** Class-based enter/leave transition (Headless UI); the child element receives the transition classes. */
const Transition: FC<Props> = ({ children, ...props }) => (
  <HeadlessTransition {...props}>{children}</HeadlessTransition>
);

export default Transition;
