import { Input } from '@headlessui/react';
import { Eye, EyeOff } from 'lucide-react';
import { ChangeEvent, FC } from 'react';

import classes from './password-field.module.scss';
import IconButton from '../icon-button/icon-button';

type Props = {
  id?: string;
  name?: string;
  value: string;
  autoComplete?: string;
  disabled?: boolean;
  revealable?: boolean;
  visible: boolean;
  onChange: (value: string) => void;
  onToggleVisible: () => void;
};

const PasswordFieldView: FC<Props> = ({
  id,
  name,
  value,
  autoComplete,
  disabled = false,
  revealable = true,
  visible,
  onChange,
  onToggleVisible,
}) => (
  <div className={classes.field}>
    <Input
      id={id}
      name={name}
      className={revealable ? classes.input : `${classes.input} ${classes.plain}`}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>): void => onChange(e.target.value)}
      disabled={disabled}
    />
    {revealable && (
      <IconButton
        type="button"
        variant="ghost"
        shape="square"
        size="sm"
        className={classes.toggle}
        onClick={onToggleVisible}
        disabled={disabled}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeOff size={18} strokeWidth={1.75} aria-hidden />
        ) : (
          <Eye size={18} strokeWidth={1.75} aria-hidden />
        )}
      </IconButton>
    )}
  </div>
);

export default PasswordFieldView;
