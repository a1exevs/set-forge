import { render } from '@testing-library/react';

import Skeleton from '../skeleton';

describe('Skeleton', () => {
  it('is hidden from assistive technology', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('passes the size down as custom properties', () => {
    const { container } = render(<Skeleton variant="rect" width="8rem" height="2.5rem" />);
    const bone = container.firstChild as HTMLElement;
    expect(bone.style.getPropertyValue('--skeleton-width')).toBe('8rem');
    expect(bone.style.getPropertyValue('--skeleton-height')).toBe('2.5rem');
  });
});
