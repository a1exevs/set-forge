import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';

import classes from 'src/shared/ui/button/button.module.scss';

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
  }
>;

const Button: FC<Props> = ({ children, variant = 'primary', size = 'md', className = undefined, ...props }) => {
  const classNames: string = [classes.button, classes[variant], classes[size], className].filter(Boolean).join(' ');

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
};

export default Button;
