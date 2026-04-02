import { render, screen } from '@testing-library/react';

import NumericField from 'src/shared/ui/numeric-field/numeric-field-logic-layer';

describe('NumericField', () => {
  it('matches snapshot for decimal with value', () => {
    const { container } = render(
      <NumericField
        label="Weight (kg)"
        id="snap-weight"
        value={80}
        onChange={(): void => undefined}
        variant="decimal"
        size="sm"
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for empty integer field', () => {
    const { container } = render(
      <NumericField
        label="Reps"
        id="snap-reps-empty"
        value={null}
        onChange={(): void => undefined}
        variant="integer"
        size="sm"
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with inline error', () => {
    const { container } = render(
      <NumericField
        label="Reps"
        id="snap-reps-err"
        value={null}
        onChange={(): void => undefined}
        variant="integer"
        size="sm"
        error="Enter a valid number of reps"
      />,
    );
    expect(screen.getByText('Enter a valid number of reps')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
