import type { WorkoutList, WorkoutSession } from '@entities';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import WorkoutModePageLogicLayer from 'src/pages/workout-mode/ui/workout-mode-page-logic-layer';

const confirmDialogMock = jest.fn();

jest.mock('@shared', () => ({
  useConfirm: () => confirmDialogMock,
}));

jest.mock('canvas-confetti', () => jest.fn());

jest.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

jest.mock('@widgets', () => ({
  NotFoundMessage: ({ title }: { title: string }) => <div>{title}</div>,
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

const SESSION: WorkoutSession = {
  id: 'sess-1',
  workoutListId: 'list-1',
  workoutListName: 'Push Day',
  status: 'active',
  startedAt: '2026-06-03T12:00:00.000Z',
  finishedAt: null,
  exercises: [
    {
      id: 'sx-1',
      sourceExerciseId: 'ex-1',
      name: 'Bench Press',
      muscleGroup: 'chest',
      weight: 60,
      reps: 10,
      sets: 3,
      completedSets: 0,
    },
  ],
};

describe('WorkoutModePageLogicLayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    confirmDialogMock.mockResolvedValue('cancel');
  });

  it('renders nothing while the workout list is loading', () => {
    const { container } = render(
      <WorkoutModePageLogicLayer
        workoutList={undefined}
        session={null}
        isStarting={false}
        startSession={jest.fn()}
        incrementProgress={jest.fn()}
        finishSession={jest.fn()}
        discardSession={jest.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('starts a session from preview when Start workout is clicked', async () => {
    const user = userEvent.setup();
    const startSession = jest.fn().mockResolvedValue(undefined);

    render(
      <WorkoutModePageLogicLayer
        workoutList={WORKOUT_LIST}
        session={null}
        isStarting={false}
        startSession={startSession}
        incrementProgress={jest.fn()}
        finishSession={jest.fn()}
        discardSession={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Start workout' }));

    expect(startSession).toHaveBeenCalledWith('list-1');
  });

  it('finishes the session when confirm returns confirm', async () => {
    const user = userEvent.setup();
    confirmDialogMock.mockResolvedValue('confirm');
    const finishSession = jest.fn().mockResolvedValue(undefined);

    render(
      <WorkoutModePageLogicLayer
        workoutList={WORKOUT_LIST}
        session={SESSION}
        isStarting={false}
        startSession={jest.fn()}
        incrementProgress={jest.fn()}
        finishSession={finishSession}
        discardSession={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Finish workout' }));

    await waitFor((): void => {
      expect(confirmDialogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          alternateText: 'Discard',
          confirmationText: 'Finish',
          cancellationText: 'Cancel',
          description:
            'Finish saves this session to history. Discard deletes this active session without saving. Cancel keeps the workout open.',
        }),
      );
      expect(finishSession).toHaveBeenCalledWith('sess-1');
    });
  });

  it('discards the session when confirm returns alternate', async () => {
    const user = userEvent.setup();
    confirmDialogMock.mockResolvedValue('alternate');
    const discardSession = jest.fn().mockResolvedValue(undefined);

    render(
      <WorkoutModePageLogicLayer
        workoutList={WORKOUT_LIST}
        session={SESSION}
        isStarting={false}
        startSession={jest.fn()}
        incrementProgress={jest.fn()}
        finishSession={jest.fn()}
        discardSession={discardSession}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Finish workout' }));

    await waitFor((): void => {
      expect(discardSession).toHaveBeenCalledWith('sess-1');
    });
  });

  it('does nothing when confirm returns cancel', async () => {
    const user = userEvent.setup();
    confirmDialogMock.mockResolvedValue('cancel');
    const finishSession = jest.fn();
    const discardSession = jest.fn();

    render(
      <WorkoutModePageLogicLayer
        workoutList={WORKOUT_LIST}
        session={SESSION}
        isStarting={false}
        startSession={jest.fn()}
        incrementProgress={jest.fn()}
        finishSession={finishSession}
        discardSession={discardSession}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Finish workout' }));

    await waitFor((): void => {
      expect(finishSession).not.toHaveBeenCalled();
      expect(discardSession).not.toHaveBeenCalled();
    });
  });
});
