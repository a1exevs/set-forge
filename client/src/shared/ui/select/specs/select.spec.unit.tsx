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

  it('names the button by its hidden label and shows the selected value', () => {
    render(<Select value="legs" options={OPTIONS} onChange={jest.fn()} ariaLabel="Muscle group" />);

    // Browsers name it "Muscle group Legs" (label + own text); jsdom drops the self-reference of aria-labelledby.
    expect(screen.getByRole('button', { name: /^Muscle group/ })).toHaveTextContent('Legs');
  });

  it('marks the button open while the list is shown, which turns its arrow up', async () => {
    const user = userEvent.setup();
    render(<Select value="legs" options={OPTIONS} onChange={jest.fn()} />);
    const button = screen.getByRole('button', { name: 'Legs' });

    expect(button).not.toHaveAttribute('data-open');
    await user.click(button);
    expect(button).toHaveAttribute('data-open');

    await user.click(screen.getByRole('option', { name: 'Chest' }));
    expect(button).not.toHaveAttribute('data-open');
  });

  it('carries the language of a label onto its option and onto the button', async () => {
    const user = userEvent.setup();
    render(
      <Select
        value="ru"
        options={[
          { value: 'en', label: 'English', lang: 'en' },
          { value: 'ru', label: 'Русский', lang: 'ru' },
        ]}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Русский')).toHaveAttribute('lang', 'ru');
    await user.click(screen.getByRole('button', { name: 'Русский' }));
    expect(screen.getByRole('option', { name: 'English' }).querySelector('[lang]')).toHaveAttribute('lang', 'en');
  });

  it('in its compact form shows the icon and the value, and picks from the same list', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <Select
        value="legs"
        options={OPTIONS}
        onChange={onChange}
        appearance="compact"
        icon={<svg data-testid="select-icon" />}
      />,
    );

    const button = screen.getByRole('button', { name: 'Legs' });
    expect(button).toContainElement(screen.getByTestId('select-icon'));
    await user.click(button);
    await user.click(screen.getByRole('option', { name: 'Chest' }));

    expect(onChange).toHaveBeenCalledWith('chest');
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
