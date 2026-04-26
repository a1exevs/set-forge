import { render } from '@testing-library/react';

import Button from 'src/shared/ui/button/button';

describe('Button', () => {
  it('matches snapshot for default', () => {
    const { container } = render(<Button>Button</Button>);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for primary variant', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for secondary variant', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for danger variant', () => {
    const { container } = render(<Button variant="danger">Danger</Button>);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for sm size', () => {
    const { container } = render(<Button size="sm">Small</Button>);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for md size', () => {
    const { container } = render(<Button size="md">Medium</Button>);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for lg size', () => {
    const { container } = render(<Button size="lg">Large</Button>);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for disabled', () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for custom className', () => {
    const { container } = render(<Button className="custom">Custom</Button>);
    expect(container).toMatchSnapshot();
  });
});
