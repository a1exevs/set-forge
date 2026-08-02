import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC, useState } from 'react';

import PasswordField from 'src/shared/ui/password-field/password-field-logic-layer';

const StatefulPasswordField: FC<{
  initialValue?: string;
  disabled?: boolean;
  autoComplete?: string;
  name?: string;
  onChange?: (value: string) => void;
}> = ({ initialValue = '', disabled, autoComplete, name, onChange }) => {
  const [value, setValue] = useState(initialValue);
  return (
    <PasswordField
      id="pwd"
      name={name}
      value={value}
      disabled={disabled}
      autoComplete={autoComplete}
      onChange={(next): void => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
};

describe('PasswordField', () => {
  describe('rendering', () => {
    it('renders a password input by default', () => {
      render(<PasswordField id="pwd" value="secret" onChange={jest.fn()} />);
      expect(screen.getByDisplayValue('secret')).toHaveAttribute('type', 'password');
    });

    it('renders show-password toggle', () => {
      render(<PasswordField id="pwd" value="" onChange={jest.fn()} />);
      expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Show password' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('forwards disabled to input and toggle', () => {
      render(<PasswordField id="pwd" value="" onChange={jest.fn()} disabled />);
      expect(screen.getByDisplayValue('')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled();
    });

    it('applies autoComplete when provided', () => {
      render(<PasswordField id="pwd" value="" onChange={jest.fn()} autoComplete="current-password" />);
      expect(screen.getByDisplayValue('')).toHaveAttribute('autocomplete', 'current-password');
    });

    it('applies name when provided', () => {
      render(<PasswordField id="pwd" name="password" value="" onChange={jest.fn()} />);
      expect(screen.getByDisplayValue('')).toHaveAttribute('name', 'password');
    });
  });

  describe('interactions', () => {
    it('calls onChange with typed value', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<StatefulPasswordField onChange={onChange} />);
      await user.type(screen.getByDisplayValue(''), 'ab');
      expect(onChange).toHaveBeenCalledWith('a');
      expect(onChange).toHaveBeenCalledWith('ab');
      expect(screen.getByDisplayValue('ab')).toBeInTheDocument();
    });

    it('toggles visibility between password and text', async () => {
      const user = userEvent.setup();
      render(<PasswordField id="pwd" value="secret" onChange={jest.fn()} />);
      const input = screen.getByDisplayValue('secret');
      const toggle = screen.getByRole('button', { name: 'Show password' });

      await user.click(toggle);

      expect(input).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true');

      await user.click(screen.getByRole('button', { name: 'Hide password' }));

      expect(input).toHaveAttribute('type', 'password');
      expect(screen.getByRole('button', { name: 'Show password' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('does not toggle when disabled', async () => {
      const user = userEvent.setup();
      render(<PasswordField id="pwd" value="secret" onChange={jest.fn()} disabled />);
      await user.click(screen.getByRole('button', { name: 'Show password' }));
      expect(screen.getByDisplayValue('secret')).toHaveAttribute('type', 'password');
    });
  });
});
