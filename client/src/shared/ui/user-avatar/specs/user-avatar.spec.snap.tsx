import { render } from '@testing-library/react';

import UserAvatar from '../user-avatar';

describe('UserAvatar', () => {
  it('matches snapshot', () => {
    const { container } = render(<UserAvatar letter="J" />);
    expect(container).toMatchSnapshot();
  });
});
