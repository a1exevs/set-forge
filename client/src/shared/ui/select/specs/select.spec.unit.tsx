import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Select, { type SelectOption } from '../select';

const OPTIONS: SelectOption[] = [
  { value: 'chest', label: 'Chest' },
  { value: 'legs', label: 'Legs' },
];

describe('Select', () => {
  it('opens its options on a press', async () => {
    const user = userEvent.setup();
    render(<Select value="legs" options={OPTIONS} onChange={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Legs' }));

    expect(screen.getByRole('option', { name: 'Chest' })).toBeInTheDocument();
  });

  it('stays closed when disabled', async () => {
    const user = userEvent.setup();
    render(<Select value="legs" options={OPTIONS} onChange={jest.fn()} disabled />);

    const button = screen.getByRole('button', { name: 'Legs' });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });
});
