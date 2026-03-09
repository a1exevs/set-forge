import { render } from '@testing-library/react';
import type { ExerciseFormData } from '@widgets/workout-list-form/model';

import { ConfirmDialogProvider } from '@shared';
import { WorkoutListForm } from '@widgets';
import WorkoutListFormPresentation from '@widgets/workout-list-form/ui/workout-list-form';

const mockOnSubmit = (): void => undefined;
const mockOnCancel = (): void => undefined;

const exercisesWithData: ExerciseFormData[] = [
  {
    tempId: 'temp-1',
    name: 'Bench Press',
    muscleGroup: 'chest',
    weight: 80,
    reps: 10,
    sets: 3,
  },
];

const initialDataSingleExercise = {
  id: 'list-1',
  name: 'Push Day',
  description: 'Chest focus',
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

const initialDataMultipleExercises = {
  id: 'list-2',
  name: 'Full Body',
  description: 'Chest, shoulders, triceps',
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
    {
      id: 'ex-2',
      name: 'Overhead Press',
      muscleGroup: 'shoulders' as const,
      weight: 50,
      reps: 8,
      sets: 4,
      completedSets: 0,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  lastUsedAt: null,
};

describe('WorkoutListForm', () => {
  it('matches snapshot for create mode (empty)', () => {
    const { container } = render(
      <ConfirmDialogProvider>
        <WorkoutListForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </ConfirmDialogProvider>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for create mode (with exercises)', () => {
    const { container } = render(
      <ConfirmDialogProvider>
        <WorkoutListFormPresentation
          title="New Workout List"
          submitButtonText="Create List"
          name="Push Day"
          description="Chest focus"
          exercises={exercisesWithData}
          onNameChange={(): void => undefined}
          onDescriptionChange={(): void => undefined}
          onAddExercise={(): void => undefined}
          onRemoveExercise={(): void => undefined}
          onUpdateExercise={(): void => undefined}
          onSubmit={(): void => undefined}
          onCancel={(): void => undefined}
        />
      </ConfirmDialogProvider>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for edit mode (single exercise)', () => {
    const { container } = render(
      <ConfirmDialogProvider>
        <WorkoutListForm
          mode="edit"
          initialData={initialDataSingleExercise}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </ConfirmDialogProvider>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for edit mode (multiple exercises)', () => {
    const { container } = render(
      <ConfirmDialogProvider>
        <WorkoutListForm
          mode="edit"
          initialData={initialDataMultipleExercises}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </ConfirmDialogProvider>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for edit mode without initialData', () => {
    const { container } = render(
      <ConfirmDialogProvider>
        <WorkoutListForm mode="edit" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </ConfirmDialogProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
