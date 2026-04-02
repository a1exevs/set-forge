import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import NumericField from 'src/shared/ui/numeric-field/numeric-field-logic-layer';

describe('NumericField', () => {
  describe('rendering', () => {
    it('renders label and integer value', () => {
      const onChange = jest.fn();
      render(<NumericField label="Reps" id="reps-field" value={10} onChange={onChange} variant="integer" size="sm" />);
      expect(screen.getByLabelText('Reps')).toBeInTheDocument();
      expect(screen.getByLabelText('Reps')).toHaveValue('10');
    });

    it('renders empty when value is null', () => {
      const onChange = jest.fn();
      render(
        <NumericField label="Reps" id="reps-field" value={null} onChange={onChange} variant="integer" size="sm" />,
      );
      expect(screen.getByLabelText('Reps')).toHaveValue('');
    });

    it('shows error message when error is set', () => {
      const onChange = jest.fn();
      render(
        <NumericField
          label="Reps"
          id="reps-field"
          value={null}
          onChange={onChange}
          variant="integer"
          size="sm"
          error="Enter a valid number of reps"
        />,
      );
      expect(screen.getByText('Enter a valid number of reps')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('replaces entire value when typing after focus (select-all on focus)', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<NumericField label="Reps" id="reps-field" value={10} onChange={onChange} variant="integer" size="sm" />);
      const input = screen.getByLabelText('Reps');
      await user.click(input);
      await user.keyboard('5');
      expect(onChange).toHaveBeenLastCalledWith(5);
      expect(input).toHaveValue('5');
    });

    it('calls onChange with null when cleared', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<NumericField label="Reps" id="reps-field" value={10} onChange={onChange} variant="integer" size="sm" />);
      const input = screen.getByLabelText('Reps');
      await user.click(input);
      await user.keyboard('{Backspace}');
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('parses decimal input', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(
        <NumericField label="Weight (kg)" id="w-field" value={null} onChange={onChange} variant="decimal" size="sm" />,
      );
      const input = screen.getByLabelText('Weight (kg)');
      await user.type(input, '12.5');
      expect(onChange).toHaveBeenLastCalledWith(12.5);
    });
  });
});
