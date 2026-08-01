import { Button as HeadlessButton } from '@headlessui/react';
import { ButtonHTMLAttributes, ElementType, FC, PropsWithChildren } from 'react';

import classes from 'src/shared/ui/icon-button/icon-button.module.scss';

type CommonProps = PropsWithChildren<{
  variant?: 'ghost' | 'primary';
  shape?: 'square' | 'circle';
  size?: 'sm' | 'md' | 'lg';
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
    className = undefined,
    ...rest
  } = props;

  const type = as === 'button' ? ((props as AsButtonProps).type ?? 'button') : undefined;
  const { type: _type, ...headlessRest } = rest as AsButtonProps;

  const classNames: string = [classes.iconButton, classes[variant], classes[shape], classes[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <HeadlessButton as={as} type={type} className={classNames} {...headlessRest}>
      {children}
    </HeadlessButton>
  );
};

export default IconButton;
