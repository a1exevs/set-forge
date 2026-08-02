import type { WorkoutList, WorkoutSession } from '@entities';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import WorkoutModePage from 'src/pages/workout-mode/ui/workout-mode-page';

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

const baseProps = {
  justCompleted: null,
  isFinished: false,
  totalExercises: 1,
  completedExercises: 0,
  overallProgress: 0,
  isStarting: false,
  onTap: jest.fn(),
  onStart: jest.fn(),
  onFinish: jest.fn(),
};

describe('WorkoutModePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows not found when the workout list is missing', () => {
    render(<WorkoutModePage {...baseProps} phase="preview" workoutList={null} session={null} />);

    expect(screen.getByText('Workout list not found')).toBeInTheDocument();
  });

  it('renders preview with Start workout and exercise cards below', () => {
    render(<WorkoutModePage {...baseProps} phase="preview" workoutList={WORKOUT_LIST} session={null} />);

    expect(screen.getByText('Push Day')).toBeInTheDocument();
    expect(screen.getByText('0 / 1 exercises')).toBeInTheDocument();
    expect(screen.getByText(/Ready to train\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start workout' })).toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.queryByText('Double tap to mark a set')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Finish workout' })).not.toBeInTheDocument();
  });

  it('renders training with exercise cards and Finish workout', () => {
    render(<WorkoutModePage {...baseProps} phase="training" workoutList={WORKOUT_LIST} session={SESSION} />);

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finish workout' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start workout' })).not.toBeInTheDocument();
  });

  it('calls onStart when Start workout is clicked', async () => {
    const user = userEvent.setup();
    const onStart = jest.fn();

    render(
      <WorkoutModePage {...baseProps} phase="preview" workoutList={WORKOUT_LIST} session={null} onStart={onStart} />,
    );

    await user.click(screen.getByRole('button', { name: 'Start workout' }));

    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
