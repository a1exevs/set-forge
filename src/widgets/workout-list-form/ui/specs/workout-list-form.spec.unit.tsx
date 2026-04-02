import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import ConfirmDialogProvider from 'src/shared/ui/confirm-dialog/confirm-dialog-provider';
import WorkoutListForm from 'src/widgets/workout-list-form/ui/workout-list-form-logic-layer';

jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

const defaultProps = {
  mode: 'create' as const,
  onSubmit: mockOnSubmit,
  onCancel: mockOnCancel,
};

const initialDataEdit = {
  id: 'list-1',
  name: 'Push Day',
  description: 'Chest, shoulders',
  exercises: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroup: 'chest' as const,
      weight: 80,
      reps: 10,
      sets: 3,
      completedSets: 0,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  lastUsedAt: null,
};

describe('WorkoutListForm', () => {
  beforeEach((): void => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe('rendering', () => {
    it('renders create mode with empty form', () => {
      render(
        <ConfirmDialogProvider>
          <WorkoutListForm {...defaultProps} />
        </ConfirmDialogProvider>,
      );

      expect(screen.getByRole('heading', { name: 'New Workout List' })).toBeInTheDocument();
      expect(screen.getByLabelText(/List Name/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Push Day/)).toBeInTheDocument();
      expect(screen.getByText('Add exercises to your list')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create List' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders edit mode with pre-filled data', () => {
      render(
        <ConfirmDialogProvider>
          <WorkoutListForm {...defaultProps} mode="edit" initialData={initialDataEdit} />
        </ConfirmDialogProvider>,
      );

      expect(screen.getByRole('heading', { name: /Editing Push Day/ })).toBeInTheDocument();
      expect(screen.getByDisplayValue('Push Day')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Chest, shoulders')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bench Press')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('renders NotFoundMessage when edit mode has no initialData', () => {
      render(
        <ConfirmDialogProvider>
          <WorkoutListForm {...defaultProps} mode="edit" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
        </ConfirmDialogProvider>,
      );

      expect(screen.getByText('Workout list not found')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back to Home' })).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('shows confirm when submitting with empty name', async () => {
      const { container } = render(
        <ConfirmDialogProvider>
          <WorkoutListForm {...defaultProps} />
        </ConfirmDialogProvider>,
      );

      const form = container.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor((): void => {
        expect(screen.getByText('Please enter a list name')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows confirm when submitting with no exercises', async () => {
      const user = userEvent.setup();
      render(
        <ConfirmDialogProvider>
          <WorkoutListForm {...defaultProps} />
        </ConfirmDialogProvider>,
      );

      await user.type(screen.getByPlaceholderText(/Push Day/), 'My List');
      await user.click(screen.getByRole('button', { name: 'Create List' }));

      await waitFor((): void => {
        expect(screen.getByText('Please add at least one exercise')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows confirm when submitting with invalid exercise data', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ConfirmDialogProvider>
          <WorkoutListForm {...defaultProps} />
        </ConfirmDialogProvider>,
      );

      await user.type(screen.getByPlaceholderText(/Push Day/), 'My List');
      await user.click(screen.getByRole('button', { name: '+ Add Exercise' }));

      const form = container.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor((): void => {
        expect(screen.getByText('Please check exercise data validity')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows inline error when reps cleared and does not open numeric validity dialog', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ConfirmDialogProvider>
          <WorkoutListForm {...defaultProps} />
        </ConfirmDialogProvider>,
      );

      await user.type(screen.getByPlaceholderText(/Push Day/), 'My List');
      await user.click(screen.getByRole('button', { name: '+ Add Exercise' }));
      await user.type(screen.getByPlaceholderText('Bench Press'), 'Bench Press');

      const repsInput = screen.getByRole('textbox', { name: /^reps$/i });
      await user.clear(repsInput);

      const form = container.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor((): void => {
        expect(screen.getByText('Enter a valid number of reps')).toBeInTheDocument();
      });

      expect(screen.queryByText('Please check exercise data validity')).not.toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('interactions', () => {
    it('calls onCancel when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ConfirmDialogProvider>
          <WorkoutListForm {...defaultProps} />
        </ConfirmDialogProvider>,
      );

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit with correct DTO when form is valid', async () => {
      const user = userEvent.setup();
      render(
        <ConfirmDialogProvider>
          <WorkoutListForm {...defaultProps} />
        </ConfirmDialogProvider>,
      );

      await user.type(screen.getByPlaceholderText(/Push Day/), 'Push Day');
      await user.type(screen.getByPlaceholderText(/Chest/), 'Chest focus');
      await user.click(screen.getByRole('button', { name: '+ Add Exercise' }));

      await user.type(screen.getByPlaceholderText('Bench Press'), 'Bench Press');

      await user.click(screen.getByRole('button', { name: 'Create List' }));

      await waitFor((): void => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      const [dto] = mockOnSubmit.mock.calls[0] as [unknown];
      expect(dto).toMatchObject({
        name: 'Push Day',
        description: 'Chest focus',
        exercises: [{ name: 'Bench Press', muscleGroup: 'chest', weight: 0, reps: 10, sets: 3 }],
      });
    });

    it('adds and removes exercises', async () => {
      const user = userEvent.setup();
      render(
        <ConfirmDialogProvider>
          <WorkoutListForm {...defaultProps} />
        </ConfirmDialogProvider>,
      );

      expect(screen.getByText('Add exercises to your list')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '+ Add Exercise' }));
      expect(screen.getByPlaceholderText('Bench Press')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Remove exercise' }));
      expect(screen.getByText('Add exercises to your list')).toBeInTheDocument();
    });
  });
});
