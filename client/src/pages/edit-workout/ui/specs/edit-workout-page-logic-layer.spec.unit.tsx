import type { WorkoutList } from '@entities';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditWorkoutPageLogicLayer from 'src/pages/edit-workout/ui/edit-workout-page-logic-layer';

const confirmDialogMock = jest.fn();
const navigateMock = jest.fn();

jest.mock('@shared', () => ({
  useConfirm: () => confirmDialogMock,
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
    onSubmit: (dto: { name: string; description: string; exercises: unknown[] }) => void;
    onCancel: () => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={(): void =>
          onSubmit({
            name: 'Push Day',
            description: 'Updated',
            exercises: [],
          })
        }
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

describe('EditWorkoutPageLogicLayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    confirmDialogMock.mockResolvedValue('cancel');
  });

  it('saves immediately when there is no active session', async () => {
    const user = userEvent.setup();
    const updateWorkoutList = jest.fn().mockResolvedValue(true);

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
      expect(updateWorkoutList).toHaveBeenCalledWith('list-1', {
        name: 'Push Day',
        description: 'Updated',
        exercises: [],
      });
      expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
    });
  });

  it('does not save when session confirm is cancelled', async () => {
    const user = userEvent.setup();
    const updateWorkoutList = jest.fn().mockResolvedValue(true);

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
    });
  });

  it('saves without resync when Keep session is chosen', async () => {
    const user = userEvent.setup();
    confirmDialogMock.mockResolvedValue('alternate');
    const updateWorkoutList = jest.fn().mockResolvedValue(true);
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
      expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
    });
  });

  it('saves and resyncs when Update session is chosen', async () => {
    const user = userEvent.setup();
    confirmDialogMock.mockResolvedValue('confirm');
    const updateWorkoutList = jest.fn().mockResolvedValue(true);
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
      expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
    });
  });
});
