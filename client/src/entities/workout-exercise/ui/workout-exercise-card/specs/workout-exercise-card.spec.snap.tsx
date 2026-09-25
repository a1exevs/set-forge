import { render } from '@testing-library/react';

import type { WorkoutExercise } from '../../../model/workout-exercise';
import WorkoutExerciseCard from '../workout-exercise-card';

const EXERCISE: WorkoutExercise = {
  id: 'ex-1',
  name: 'Bench Press',
  muscleGroup: 'chest',
  weight: 60,
  reps: 10,
  sets: 3,
};

describe('WorkoutExerciseCard', () => {
  it('matches snapshot', () => {
    const { container } = render(<WorkoutExerciseCard exercise={EXERCISE} />);
    expect(container).toMatchSnapshot();
  });
});
