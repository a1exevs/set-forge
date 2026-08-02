import { render, screen } from '@testing-library/react';

import type { WorkoutExercise } from 'src/entities/workout-exercise/model/types';
import WorkoutExerciseCard from 'src/entities/workout-exercise/ui/workout-exercise-card/workout-exercise-card';

const EXERCISE: WorkoutExercise = {
  id: 'ex-1',
  name: 'Bench Press',
  muscleGroup: 'chest',
  weight: 60,
  reps: 10,
  sets: 3,
};

describe('WorkoutExerciseCard', () => {
  describe('rendering', () => {
    it('renders exercise name', () => {
      render(<WorkoutExerciseCard exercise={EXERCISE} />);

      expect(screen.getByRole('heading', { name: 'Bench Press' })).toBeInTheDocument();
    });

    it('renders muscle group label', () => {
      render(<WorkoutExerciseCard exercise={EXERCISE} />);

      expect(screen.getByText('Chest')).toBeInTheDocument();
    });

    it('renders weight, reps, and sets', () => {
      render(<WorkoutExerciseCard exercise={EXERCISE} />);

      expect(screen.getByText('60 kg')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('is read-only without training hint or button role', () => {
      render(<WorkoutExerciseCard exercise={EXERCISE} />);

      expect(screen.queryByText('Double tap to mark a set')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByText(/\d+\s*\/\s*\d+/)).not.toBeInTheDocument();
    });
  });
});
