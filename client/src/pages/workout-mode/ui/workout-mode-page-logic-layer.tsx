import type { WorkoutList } from '@entities';
import confetti from 'canvas-confetti';
import { FC, useEffect, useRef, useState } from 'react';

import { useConfirm } from '@shared';

import WorkoutModePage from 'src/pages/workout-mode/ui/workout-mode-page';

const fireWorkoutCompleteConfetti = (): void => {
  void confetti({ particleCount: 110, spread: 72, origin: { y: 0.62 } });
  void confetti({ particleCount: 70, angle: 55, spread: 58, origin: { x: 0, y: 0.62 } });
  void confetti({ particleCount: 70, angle: 125, spread: 58, origin: { x: 1, y: 0.62 } });
};

type Props = {
  id: string;
  workout: WorkoutList | null | undefined;
  updateWorkoutProgress: (listId: string, exerciseId: string) => Promise<void>;
  resetAllProgress: (listId: string) => Promise<void>;
};

const WorkoutModePageLogicLayer: FC<Props> = ({ id, workout, updateWorkoutProgress, resetAllProgress }) => {
  const confirmDialog = useConfirm();
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const lastTapRef = useRef<Record<string, number>>({});
  const prevCompletedExercisesRef = useRef<number | null>(null);

  const handleExerciseClick = (exerciseId: string): void => {
    if (!workout) {
      return;
    }

    const exercise = workout.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) {
      return;
    }

    if (exercise.completedSets >= exercise.sets) {
      return;
    }
    void updateWorkoutProgress(workout.id, exerciseId);

    if (exercise.completedSets + 1 === exercise.sets) {
      setJustCompleted(exerciseId);
      setTimeout((): void => setJustCompleted(null), 1000);
    }
  };

  const handleTap = (exerciseId: string): void => {
    const now = Date.now();
    const lastTap = lastTapRef.current[exerciseId] || 0;
    const timeSinceLastTap = now - lastTap;

    const DOUBLE_TAP_THRESHOLD_MS = 300;
    if (timeSinceLastTap < DOUBLE_TAP_THRESHOLD_MS && timeSinceLastTap > 0) {
      handleExerciseClick(exerciseId);
      lastTapRef.current[exerciseId] = 0;
    } else {
      lastTapRef.current[exerciseId] = now;
    }
  };

  const handleResetAll = async (): Promise<void> => {
    if (!workout) {
      return;
    }

    const ok = await confirmDialog({
      title: 'Reset all progress?',
      description: 'All completed sets will be reset.',
      confirmationText: 'Reset',
      cancellationText: 'Cancel',
    });
    if (ok) {
      void resetAllProgress(workout.id);
    }
  };

  const calculateProgress = (): { totalExercises: number; completedExercises: number; overallProgress: number } => {
    if (!workout) {
      return { totalExercises: 0, completedExercises: 0, overallProgress: 0 };
    }

    const totalExercises = workout.exercises.length;
    const completedExercises = workout.exercises.filter(ex => ex.sets > 0 && ex.completedSets === ex.sets).length;
    const overallProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

    return { totalExercises, completedExercises, overallProgress };
  };

  const { totalExercises, completedExercises, overallProgress } = calculateProgress();

  useEffect((): void => {
    prevCompletedExercisesRef.current = null;
  }, [id]);

  useEffect((): void => {
    if (!workout || workout.id !== id) {
      return;
    }
    const prev = prevCompletedExercisesRef.current;
    if (totalExercises > 0 && prev !== null && prev < totalExercises && completedExercises === totalExercises) {
      fireWorkoutCompleteConfetti();
    }
    prevCompletedExercisesRef.current = completedExercises;
  }, [id, workout, completedExercises, totalExercises]);

  if (workout === undefined) {
    return null;
  }

  return (
    <WorkoutModePage
      currentWorkout={workout}
      justCompleted={justCompleted}
      totalExercises={totalExercises}
      completedExercises={completedExercises}
      overallProgress={overallProgress}
      onTap={handleTap}
      onResetAll={handleResetAll}
    />
  );
};

export default WorkoutModePageLogicLayer;
