import { FC, useState } from 'react';

import PasswordFieldView from './password-field';

type Props = {
  id?: string;
  name?: string;
  value: string;
  autoComplete?: string;
  disabled?: boolean;
  revealable?: boolean;
  onChange: (value: string) => void;
};

const PasswordField: FC<Props> = ({ id, name, value, autoComplete, disabled = false, revealable = true, onChange }) => {
  const [visible, setVisible] = useState(false);

  return (
    <PasswordFieldView
      id={id}
      name={name}
      value={value}
      autoComplete={autoComplete}
      disabled={disabled}
      revealable={revealable}
      visible={revealable && visible}
      onChange={onChange}
      onToggleVisible={(): void => setVisible(v => !v)}
    />
  );
};

export default PasswordField;
