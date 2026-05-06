import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UserAvatarMenu from 'src/shared/ui/user-avatar-menu/user-avatar-menu';

describe('UserAvatarMenu', () => {
  it('renders letter and opens menu', async () => {
    const onLogout = jest.fn();
    const user = userEvent.setup();
    render(
      <UserAvatarMenu letter="T" ariaLabel="Account" items={[{ id: 'logout', label: 'Log out', onClick: onLogout }]} />,
    );

    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Account' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Log out' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
