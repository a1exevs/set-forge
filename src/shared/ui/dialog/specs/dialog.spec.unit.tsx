import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Dialog from 'src/shared/ui/dialog/dialog';

describe('Dialog', () => {
  describe('rendering', () => {
    it('renders children when open', () => {
      render(
        <Dialog open={true} onClose={(): void => undefined}>
          <div>Dialog content</div>
        </Dialog>,
      );
      expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      render(
        <Dialog open={false} onClose={(): void => undefined}>
          <div>Dialog content</div>
        </Dialog>,
      );
      expect(screen.queryByText('Dialog content')).not.toBeInTheDocument();
    });

    it('renders with aria-label when provided', () => {
      render(
        <Dialog open={true} onClose={(): void => undefined} ariaLabel="Test dialog">
          <div>Content</div>
        </Dialog>,
      );
      expect(screen.getByRole('dialog', { name: 'Test dialog' })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = jest.fn();
      const user = userEvent.setup();
      render(
        <Dialog open={true} onClose={onClose}>
          <button type="button" onClick={(): void => onClose()}>
            Close
          </button>
        </Dialog>,
      );

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(onClose).toHaveBeenCalled();
    });
  });
});
