import { Button as HeadlessButton } from '@headlessui/react';
import { LoaderCircle } from 'lucide-react';
import { ButtonHTMLAttributes, FC, MouseEvent, PropsWithChildren } from 'react';

import type { Progress } from '@shared/lib';

import classes from './button.module.scss';

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger' | 'accent';
    size?: 'sm' | 'md' | 'lg';
    /** The request of this action: `locked` ignores presses, `shown` also swaps the label for an indicator. */
    progress?: Progress;
  }
>;

const Button: FC<Props> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = undefined,
  progress = 'idle',
  onClick,
  ...props
}) => {
  const classNames: string = [classes.button, classes[variant], classes[size], className].filter(Boolean).join(' ');
  const inFlight = progress !== 'idle';

  return (
    <HeadlessButton
      className={classNames}
      {...props}
      aria-disabled={inFlight || props['aria-disabled']}
      aria-busy={inFlight || undefined}
      data-progress={inFlight ? progress : undefined}
      onClick={(event: MouseEvent<HTMLButtonElement>): void => {
        // Not `disabled`: the button keeps its look and focus; a press in flight (a submit too) does nothing.
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

export default Button;
