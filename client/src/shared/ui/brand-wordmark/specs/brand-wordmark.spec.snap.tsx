import { render } from '@testing-library/react';

import BrandWordmark from 'src/shared/ui/brand-wordmark/brand-wordmark';

describe('BrandWordmark', () => {
  it('matches snapshot for Workout lists', () => {
    const { container } = render(<BrandWordmark title="Workout lists" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for Set Forge', () => {
    const { container } = render(<BrandWordmark title="Set Forge" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for Profile', () => {
    const { container } = render(<BrandWordmark title="Profile" />);
    expect(container).toMatchSnapshot();
  });
});
