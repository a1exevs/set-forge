import type { CreateWorkoutListDto } from '@entities';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateWorkoutPageLogicLayer from 'src/pages/create-workout/ui/create-workout-page-logic-layer';

const navigateMock = jest.fn();
const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();

jest.mock('@shared', () => ({
  toastSuccess: (...args: unknown[]): void => toastSuccessMock(...args),
  toastError: (...args: unknown[]): void => toastErrorMock(...args),
}));

jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}));

jest.mock('@widgets', () => ({
  WorkoutListForm: ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (dto: CreateWorkoutListDto) => void | Promise<void>;
    onCancel: () => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={(): void => {
          void onSubmit({
            name: 'Push Day',
            description: 'Chest',
            exercises: [
              {
                name: 'Bench Press',
                muscleGroup: 'chest',
                weight: 60,
                reps: 10,
                sets: 3,
              },
            ],
          });
        }}
      >
        Create List
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

const CREATE_DTO: CreateWorkoutListDto = {
  name: 'Push Day',
  description: 'Chest',
  exercises: [
    {
      name: 'Bench Press',
      muscleGroup: 'chest',
      weight: 60,
      reps: 10,
      sets: 3,
    },
  ],
};

describe('CreateWorkoutPageLogicLayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates the list, shows success toast, and navigates home', async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn().mockResolvedValue(undefined);

    render(<CreateWorkoutPageLogicLayer onCreate={onCreate} />);

    await user.click(screen.getByRole('button', { name: 'Create List' }));

    await waitFor((): void => {
      expect(onCreate).toHaveBeenCalledWith(CREATE_DTO);
      expect(toastSuccessMock).toHaveBeenCalledWith('Workout list created');
      expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
      expect(toastErrorMock).not.toHaveBeenCalled();
    });
  });

  it('shows error toast and does not navigate when create fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Network error');
    const onCreate = jest.fn().mockRejectedValue(error);

    render(<CreateWorkoutPageLogicLayer onCreate={onCreate} />);

    await user.click(screen.getByRole('button', { name: 'Create List' }));

    await waitFor((): void => {
      expect(onCreate).toHaveBeenCalledWith(CREATE_DTO);
      expect(toastErrorMock).toHaveBeenCalledWith(error, 'Failed to create workout list');
      expect(toastSuccessMock).not.toHaveBeenCalled();
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('navigates home when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn();

    render(<CreateWorkoutPageLogicLayer onCreate={onCreate} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
    expect(onCreate).not.toHaveBeenCalled();
  });
});
