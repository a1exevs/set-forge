import type { WorkoutList } from '@entities';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditWorkoutPageLogicLayer from 'src/pages/edit-workout/ui/edit-workout-page-logic-layer';

const confirmDialogMock = jest.fn();
const navigateMock = jest.fn();
const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();

jest.mock('@shared', () => ({
  useConfirm: () => confirmDialogMock,
  toastError: (...args: unknown[]): void => toastErrorMock(...args),
  toastSuccess: (...args: unknown[]): void => toastSuccessMock(...args),
}));

jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}));

jest.mock('@widgets', () => ({
  NotFoundMessage: ({ title }: { title: string }) => <div>{title}</div>,
  WorkoutListForm: ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (dto: { name: string; description: string; exercises: unknown[] }) => void | Promise<void>;
    onCancel: () => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={(): void => {
          void onSubmit({
            name: 'Push Day',
            description: 'Updated',
            exercises: [],
          });
        }}
      >
        Save
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

const WORKOUT_LIST: WorkoutList = {
  id: 'list-1',
  name: 'Push Day',
  description: 'Chest workout',
  exercises: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroup: 'chest',
      weight: 60,
      reps: 10,
      sets: 3,
    },
  ],
  createdAt: '2026-06-01T00:00:00.000Z',
  lastUsedAt: null,
};

const SAVE_DTO = {
  name: 'Push Day',
  description: 'Updated',
  exercises: [],
};

describe('EditWorkoutPageLogicLayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    confirmDialogMock.mockResolvedValue('cancel');
  });

  it('saves immediately when there is no active session', async () => {
    const user = userEvent.setup();
    const updateWorkoutList = jest.fn().mockResolvedValue(undefined);

    render(
      <EditWorkoutPageLogicLayer
        id="list-1"
        workout={WORKOUT_LIST}
        activeSessionId={null}
        updateWorkoutList={updateWorkoutList}
        resyncSession={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor((): void => {
      expect(confirmDialogMock).not.toHaveBeenCalled();
      expect(updateWorkoutList).toHaveBeenCalledWith('list-1', SAVE_DTO);
      expect(toastSuccessMock).toHaveBeenCalledWith('Workout list updated');
      expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
      expect(toastErrorMock).not.toHaveBeenCalled();
    });
  });

  it('does not save when session confirm is cancelled', async () => {
    const user = userEvent.setup();
    const updateWorkoutList = jest.fn().mockResolvedValue(undefined);

    render(
      <EditWorkoutPageLogicLayer
        id="list-1"
        workout={WORKOUT_LIST}
        activeSessionId="sess-1"
        updateWorkoutList={updateWorkoutList}
        resyncSession={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor((): void => {
      expect(confirmDialogMock).toHaveBeenCalled();
      expect(updateWorkoutList).not.toHaveBeenCalled();
      expect(navigateMock).not.toHaveBeenCalled();
      expect(toastSuccessMock).not.toHaveBeenCalled();
    });
  });

  it('saves without resync when Keep session is chosen', async () => {
    const user = userEvent.setup();
    confirmDialogMock.mockResolvedValue('alternate');
    const updateWorkoutList = jest.fn().mockResolvedValue(undefined);
    const resyncSession = jest.fn();

    render(
      <EditWorkoutPageLogicLayer
        id="list-1"
        workout={WORKOUT_LIST}
        activeSessionId="sess-1"
        updateWorkoutList={updateWorkoutList}
        resyncSession={resyncSession}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor((): void => {
      expect(updateWorkoutList).toHaveBeenCalled();
      expect(resyncSession).not.toHaveBeenCalled();
      expect(toastSuccessMock).toHaveBeenCalledWith('Workout list updated');
      expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
    });
  });

  it('saves and resyncs when Update session is chosen', async () => {
    const user = userEvent.setup();
    confirmDialogMock.mockResolvedValue('confirm');
    const updateWorkoutList = jest.fn().mockResolvedValue(undefined);
    const resyncSession = jest.fn().mockResolvedValue(undefined);

    render(
      <EditWorkoutPageLogicLayer
        id="list-1"
        workout={WORKOUT_LIST}
        activeSessionId="sess-1"
        updateWorkoutList={updateWorkoutList}
        resyncSession={resyncSession}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor((): void => {
      expect(updateWorkoutList).toHaveBeenCalled();
      expect(resyncSession).toHaveBeenCalledWith('sess-1');
      expect(toastSuccessMock).toHaveBeenCalledWith('Workout list updated');
      expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
    });
  });

  it('shows update error toast and does not navigate when update fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Network error');
    const updateWorkoutList = jest.fn().mockRejectedValue(error);
    const resyncSession = jest.fn();

    render(
      <EditWorkoutPageLogicLayer
        id="list-1"
        workout={WORKOUT_LIST}
        activeSessionId={null}
        updateWorkoutList={updateWorkoutList}
        resyncSession={resyncSession}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor((): void => {
      expect(toastErrorMock).toHaveBeenCalledWith(error, 'Failed to update workout list');
      expect(resyncSession).not.toHaveBeenCalled();
      expect(toastSuccessMock).not.toHaveBeenCalled();
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('shows resync error toast and does not navigate when resync fails after update', async () => {
    const user = userEvent.setup();
    confirmDialogMock.mockResolvedValue('confirm');
    const updateWorkoutList = jest.fn().mockResolvedValue(undefined);
    const error = new Error('Session sync failed');
    const resyncSession = jest.fn().mockRejectedValue(error);

    render(
      <EditWorkoutPageLogicLayer
        id="list-1"
        workout={WORKOUT_LIST}
        activeSessionId="sess-1"
        updateWorkoutList={updateWorkoutList}
        resyncSession={resyncSession}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor((): void => {
      expect(updateWorkoutList).toHaveBeenCalled();
      expect(resyncSession).toHaveBeenCalledWith('sess-1');
      expect(toastErrorMock).toHaveBeenCalledWith(error, 'Failed to update the current session');
      expect(toastSuccessMock).not.toHaveBeenCalled();
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });
});
