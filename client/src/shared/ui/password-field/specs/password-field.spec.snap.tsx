import { render } from '@testing-library/react';

import PasswordFieldView from 'src/shared/ui/password-field/password-field';
import PasswordField from 'src/shared/ui/password-field/password-field-logic-layer';

describe('PasswordField', () => {
  it('matches snapshot for empty field', () => {
    const { container } = render(
      <PasswordField id="snap-pwd-empty" name="password" value="" onChange={(): void => undefined} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with value', () => {
    const { container } = render(
      <PasswordField
        id="snap-pwd"
        name="password"
        value="secret"
        onChange={(): void => undefined}
        autoComplete="new-password"
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when password is visible', () => {
    const { container } = render(
      <PasswordFieldView
        id="snap-pwd-visible"
        name="password"
        value="secret"
        visible
        onChange={(): void => undefined}
        onToggleVisible={(): void => undefined}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when disabled', () => {
    const { container } = render(
      <PasswordField id="snap-pwd-disabled" name="password" value="secret" onChange={(): void => undefined} disabled />,
    );
    expect(container).toMatchSnapshot();
  });
});
