import { render } from '@testing-library/react';

import UserAvatarMenu from 'src/shared/ui/user-avatar-menu/user-avatar-menu';

describe('UserAvatarMenu', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <UserAvatarMenu
        letter="A"
        ariaLabel="Account menu"
        items={[{ id: 'logout', label: 'Log out', onClick: (): void => undefined }]}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
