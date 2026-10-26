import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useLanguageStore } from '@shared/lib';

import type { WorkoutSessionExercise } from '../../../model/workout-session-exercise';
import WorkoutSessionExerciseCard from '../workout-session-exercise-card-logic-layer';

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
  describe('rendering', () => {
    it('renders exercise name and muscle group', () => {
      render(
        <WorkoutSessionExerciseCard exercise={EXERCISE} justCompleted={false} isFinished={false} onTap={jest.fn()} />,
      );

      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Chest')).toBeInTheDocument();
    });

    it('renders weight, reps, and completed sets', () => {
      render(
        <WorkoutSessionExerciseCard exercise={EXERCISE} justCompleted={false} isFinished={false} onTap={jest.fn()} />,
      );

      expect(screen.getByText('60 kg')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('exposes an accessible button with set progress in the label', () => {
      render(
        <WorkoutSessionExerciseCard exercise={EXERCISE} justCompleted={false} isFinished={false} onTap={jest.fn()} />,
      );

      expect(screen.getByRole('button', { name: 'Bench Press: 1 of 3 sets' })).toBeInTheDocument();
    });

    it('shows double-tap hint when incomplete and not finished', () => {
      render(
        <WorkoutSessionExerciseCard exercise={EXERCISE} justCompleted={false} isFinished={false} onTap={jest.fn()} />,
      );

      expect(screen.getByText('Double tap to mark a set')).toBeInTheDocument();
    });

    it('hides double-tap hint when exercise is completed', () => {
      render(
        <WorkoutSessionExerciseCard
          exercise={COMPLETED_EXERCISE}
          justCompleted={false}
          isFinished={false}
          onTap={jest.fn()}
        />,
      );

      expect(screen.queryByText('Double tap to mark a set')).not.toBeInTheDocument();
    });

    it('hides double-tap hint when workout is finished', () => {
      render(
        <WorkoutSessionExerciseCard exercise={EXERCISE} justCompleted={false} isFinished={true} onTap={jest.fn()} />,
      );

      expect(screen.queryByText('Double tap to mark a set')).not.toBeInTheDocument();
    });

    it('shows checkmark when justCompleted', () => {
      render(
        <WorkoutSessionExerciseCard exercise={EXERCISE} justCompleted={true} isFinished={false} onTap={jest.fn()} />,
      );

      expect(screen.getByText('✓')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onTap with exercise id when clicked', async () => {
      const user = userEvent.setup();
      const onTap = jest.fn();

      render(<WorkoutSessionExerciseCard exercise={EXERCISE} justCompleted={false} isFinished={false} onTap={onTap} />);

      await user.click(screen.getByRole('button', { name: 'Bench Press: 1 of 3 sets' }));

      expect(onTap).toHaveBeenCalledTimes(1);
      expect(onTap).toHaveBeenCalledWith('sx-1');
    });

    it('calls onTap when Enter or Space is pressed', async () => {
      const user = userEvent.setup();
      const onTap = jest.fn();

      render(<WorkoutSessionExerciseCard exercise={EXERCISE} justCompleted={false} isFinished={false} onTap={onTap} />);

      const card = screen.getByRole('button', { name: 'Bench Press: 1 of 3 sets' });
      card.focus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(onTap).toHaveBeenCalledTimes(2);
      expect(onTap).toHaveBeenCalledWith('sx-1');
    });
  });

  // AC-2 of #112: the sets in the plural form of the language; in Russian after «из» — из 1 / 21 подхода, из 3 / 5 / 11 подходов
  it.each([
    ['ru', 1, 'Bench Press: 0 из 1 подхода'],
    ['ru', 2, 'Bench Press: 0 из 2 подходов'],
    ['ru', 5, 'Bench Press: 0 из 5 подходов'],
    ['ru', 11, 'Bench Press: 0 из 11 подходов'],
    ['ru', 21, 'Bench Press: 0 из 21 подхода'],
    ['ru', 22, 'Bench Press: 0 из 22 подходов'],
    ['en', 1, 'Bench Press: 0 of 1 set'],
    ['en', 2, 'Bench Press: 0 of 2 sets'],
  ] as const)('names the card in %s with %i sets in the right plural form', (language, sets, name) => {
    act((): void => useLanguageStore.getState().setLanguage(language));
    render(
      <WorkoutSessionExerciseCard
        exercise={{ ...EXERCISE, completedSets: 0, sets }}
        justCompleted={false}
        isFinished={false}
        onTap={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  });
});
