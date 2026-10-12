import { Button as HeadlessButton } from '@headlessui/react';
import { LoaderCircle } from 'lucide-react';
import { ButtonHTMLAttributes, ElementType, FC, MouseEvent, PropsWithChildren } from 'react';

import type { Progress } from '@shared/lib';

import classes from './icon-button.module.scss';

type CommonProps = PropsWithChildren<{
  variant?: 'ghost' | 'primary';
  shape?: 'square' | 'circle';
  size?: 'sm' | 'md' | 'lg';
  /** The request of this action: `locked` ignores presses, `shown` also swaps the icon for an indicator. */
  progress?: Progress;
}>;

type AsButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button';
    to?: never;
  };

type AsLinkProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
    as: ElementType;
    to: string;
  };

type Props = AsButtonProps | AsLinkProps;

const IconButton: FC<Props> = props => {
  const {
    as = 'button',
    children,
    variant = 'ghost',
    shape = 'square',
    size = 'md',
    progress = 'idle',
    className = undefined,
    onClick,
    ...rest
  } = props;

  const type = as === 'button' ? ((props as AsButtonProps).type ?? 'button') : undefined;
  const { type: _type, ...headlessRest } = rest as AsButtonProps;
  const inFlight = progress !== 'idle';

  const classNames: string = [classes.iconButton, classes[variant], classes[shape], classes[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <HeadlessButton
      as={as}
      type={type}
      className={classNames}
      {...headlessRest}
      aria-disabled={inFlight || headlessRest['aria-disabled']}
      aria-busy={inFlight || undefined}
      data-progress={inFlight ? progress : undefined}
      onClick={(event: MouseEvent<HTMLButtonElement>): void => {
        // Not `disabled`: the button keeps its look and focus; a press in flight does nothing.
        if (inFlight) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      <span className={classes.label}>{children}</span>
      {progress === 'shown' && (
        <span className={classes.indicator}>
          <LoaderCircle aria-hidden />
          <span className={classes.indicatorText}>Loading</span>
        </span>
      )}
    </HeadlessButton>
  );
};

export default IconButton;
