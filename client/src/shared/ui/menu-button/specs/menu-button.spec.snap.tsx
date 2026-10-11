import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MenuButton from '../menu-button';
import type { MenuButtonItem } from '../menu-button';

const defaultItems: MenuButtonItem[] = [
  { id: 'edit', label: 'Edit', onClick: (): void => undefined },
  { id: 'delete', label: 'Delete', onClick: (): void => undefined },
];

describe('MenuButton', () => {
  it('matches snapshot when closed', () => {
    const { container } = render(<MenuButton items={defaultItems} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when opened', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<MenuButton items={defaultItems} />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    await waitFor((): void => {
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    });

    expect(baseElement).toMatchSnapshot();
  });
});
