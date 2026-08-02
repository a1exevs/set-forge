import { render } from '@testing-library/react';

import type { WorkoutSessionExercise } from 'src/entities/workout-session-exercise/model/types';
import WorkoutSessionExerciseCard from 'src/entities/workout-session-exercise/ui/workout-session-exercise-card/workout-session-exercise-card-logic-layer';

const EXERCISE: WorkoutSessionExercise = {
  id: 'sx-1',
  sourceExerciseId: 'ex-1',
  name: 'Bench Press',
  muscleGroup: 'chest',
  weight: 60,
  reps: 10,
  sets: 3,
  completedSets: 1,
};

const COMPLETED_EXERCISE: WorkoutSessionExercise = {
  ...EXERCISE,
  completedSets: 3,
};

describe('WorkoutSessionExerciseCard', () => {
  it('matches snapshot for in-progress exercise', () => {
    const { container } = render(
      <WorkoutSessionExerciseCard exercise={EXERCISE} justCompleted={false} isFinished={false} onTap={jest.fn()} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for completed exercise', () => {
    const { container } = render(
      <WorkoutSessionExerciseCard
        exercise={COMPLETED_EXERCISE}
        justCompleted={false}
        isFinished={false}
        onTap={jest.fn()}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when justCompleted', () => {
    const { container } = render(
      <WorkoutSessionExerciseCard exercise={EXERCISE} justCompleted={true} isFinished={false} onTap={jest.fn()} />,
    );
    expect(container).toMatchSnapshot();
  });
});
