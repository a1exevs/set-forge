import { render } from '@testing-library/react';

import UserAvatar from 'src/shared/ui/user-avatar/user-avatar';

describe('UserAvatar', () => {
  it('matches snapshot', () => {
    const { container } = render(<UserAvatar letter="J" />);
    expect(container).toMatchSnapshot();
  });
});
