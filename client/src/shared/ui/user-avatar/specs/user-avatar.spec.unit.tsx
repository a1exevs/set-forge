import { render, screen } from '@testing-library/react';

import UserAvatar from 'src/shared/ui/user-avatar/user-avatar';

describe('UserAvatar', () => {
  it('renders letter', () => {
    render(<UserAvatar letter="J" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });
});
