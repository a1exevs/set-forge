import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

import NotFoundMessage from 'src/widgets/not-found-message/ui/not-found-message';

jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe('NotFoundMessage', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<NotFoundMessage title="Workout list not found" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with custom backToLink', () => {
    const { container } = render(<NotFoundMessage title="Workout list not found" backToLink="/custom" />);
    expect(container).toMatchSnapshot();
  });
});
