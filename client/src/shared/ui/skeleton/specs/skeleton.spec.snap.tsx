import { render } from '@testing-library/react';

import Skeleton from '../skeleton';

describe('Skeleton', () => {
  it('matches snapshot for the default text bone', () => {
    const { container } = render(<Skeleton />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for a sized rect bone', () => {
    const { container } = render(<Skeleton variant="rect" width="8rem" height="2.5rem" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for a circle bone', () => {
    const { container } = render(<Skeleton variant="circle" />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for a text-shaped bone', () => {
    const { container } = render(<Skeleton text="Ready to train? Tap Start workout when you begin." />);
    expect(container).toMatchSnapshot();
  });
});
