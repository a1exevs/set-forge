import { FC, useState } from 'react';

import PasswordFieldView from './password-field';

type Props = {
  id?: string;
  name?: string;
  value: string;
  autoComplete?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

const PasswordField: FC<Props> = ({ id, name, value, autoComplete, disabled = false, onChange }) => {
  const [visible, setVisible] = useState(false);

  return (
    <PasswordFieldView
      id={id}
      name={name}
      value={value}
      autoComplete={autoComplete}
      disabled={disabled}
      visible={visible}
      onChange={onChange}
      onToggleVisible={(): void => setVisible(v => !v)}
    />
  );
};

export default PasswordField;
