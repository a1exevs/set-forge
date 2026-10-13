import { render, screen } from '@testing-library/react';

import type { WorkoutList } from '@entities/workout-list';

import EditWorkoutPage from '../edit-workout-page';

jest.mock('@shared/ui', () => ({
  ...jest.requireActual('@shared/ui'),
  NotFoundMessage: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock('@widgets/workout-list-form', () => ({
  WorkoutListFormSkeleton: () => <div role="status" aria-label="Loading workout list" />,
  WorkoutListForm: ({ initialData }: { initialData: WorkoutList }) => <form aria-label={`Edit ${initialData.name}`} />,
}));

const WORKOUT_LIST: WorkoutList = {
  id: 'list-1',
  name: 'Push Day',
  description: 'Chest workout',
  exercises: [],
  createdAt: '2026-06-01T00:00:00.000Z',
  lastUsedAt: null,
};

const baseProps = {
  loadingPhase: 'content' as const,
  workout: WORKOUT_LIST,
  submitProgress: 'idle' as const,
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
};

describe('EditWorkoutPage', () => {
  it('shows nothing during the first 300 ms of loading', () => {
    const { container } = render(<EditWorkoutPage {...baseProps} loadingPhase="blank" workout={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the form skeleton while the list loads', () => {
    render(<EditWorkoutPage {...baseProps} loadingPhase="skeleton" workout={null} />);

    expect(screen.getByRole('status', { name: 'Loading workout list' })).toBeInTheDocument();
    expect(screen.queryByText('Workout list not found')).not.toBeInTheDocument();
  });

  it('shows not found when the list is missing', () => {
    render(<EditWorkoutPage {...baseProps} workout={null} />);

    expect(screen.getByText('Workout list not found')).toBeInTheDocument();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  it('shows the form with the list', () => {
    render(<EditWorkoutPage {...baseProps} />);

    expect(screen.getByRole('form', { name: 'Edit Push Day' })).toBeInTheDocument();
  });
});
