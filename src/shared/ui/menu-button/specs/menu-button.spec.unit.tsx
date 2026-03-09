import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MenuButton from 'src/shared/ui/menu-button/menu-button';
import type { MenuItem } from 'src/shared/ui/menu-button/menu-button.types';

const defaultItems: MenuItem[] = [
  { id: 'edit', label: 'Edit', onClick: (): void => undefined },
  { id: 'delete', label: 'Delete', onClick: (): void => undefined },
];

describe('MenuButton', () => {
  describe('rendering', () => {
    it('renders trigger button with default aria-label "Open menu"', () => {
      render(<MenuButton items={defaultItems} />);
      expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
    });

    it('renders with custom ariaLabel', () => {
      render(<MenuButton items={defaultItems} ariaLabel="Workout list actions" />);
      expect(screen.getByRole('button', { name: 'Workout list actions' })).toBeInTheDocument();
    });

    it('renders menu items in order when opened', async () => {
      const user = userEvent.setup();
      render(<MenuButton items={defaultItems} />);

      await user.click(screen.getByRole('button', { name: 'Open menu' }));

      await waitFor((): void => {
        expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
      });

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems[0]).toHaveTextContent('Edit');
      expect(menuItems[1]).toHaveTextContent('Delete');
    });
  });

  describe('interactions', () => {
    it('opens dropdown when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<MenuButton items={defaultItems} />);

      expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Open menu' }));

      await waitFor((): void => {
        expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
      });
    });

    it('calls onClick and closes menu when menu item is clicked', async () => {
      const onEditClick = jest.fn();
      const user = userEvent.setup();
      const items: MenuItem[] = [
        { id: 'edit', label: 'Edit', onClick: onEditClick },
        { id: 'delete', label: 'Delete', onClick: (): void => undefined },
      ];
      render(<MenuButton items={items} />);

      await user.click(screen.getByRole('button', { name: 'Open menu' }));

      await waitFor((): void => {
        expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

      expect(onEditClick).toHaveBeenCalledTimes(1);

      await waitFor((): void => {
        expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('trigger has aria-expanded when menu is open', async () => {
      const user = userEvent.setup();
      render(<MenuButton items={defaultItems} />);

      const trigger = screen.getByRole('button', { name: 'Open menu' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      await waitFor((): void => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });
});
