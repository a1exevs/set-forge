import { render, screen } from '@testing-library/react';

import UserAvatar from '../user-avatar';

describe('UserAvatar', () => {
  it('renders letter', () => {
    render(<UserAvatar letter="J" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });
});
