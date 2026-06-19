import { render } from '@testing-library/react';

import BrandWordmark from 'src/shared/ui/brand-wordmark/brand-wordmark';

describe('BrandWordmark', () => {
  it('matches snapshot for Workout lists', () => {
    const { container } = render(<BrandWordmark title="Workout lists" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for SET FORGE', () => {
    const { container } = render(<BrandWordmark title="SET FORGE" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for PROFILE', () => {
    const { container } = render(<BrandWordmark title="PROFILE" />);
    expect(container).toMatchSnapshot();
  });
});
