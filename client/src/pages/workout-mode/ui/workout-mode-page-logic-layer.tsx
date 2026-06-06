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
  currentWorkout: WorkoutList | null;
  setCurrentWorkout: (id: string) => Promise<void>;
  clearCurrentWorkout: () => void;
  updateWorkoutProgress: (listId: string, exerciseId: string) => Promise<void>;
  resetAllProgress: (listId: string) => Promise<void>;
};

const WorkoutModePageLogicLayer: FC<Props> = ({
  id,
  currentWorkout,
  setCurrentWorkout,
  clearCurrentWorkout,
  updateWorkoutProgress,
  resetAllProgress,
}) => {
  const confirmDialog = useConfirm();
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(true);
  const lastTapRef = useRef<Record<string, number>>({});
  const prevCompletedExercisesRef = useRef<number | null>(null);

  useEffect((): (() => void) => {
    let active = true;
    setIsResolving(true);
    void (async (): Promise<void> => {
      if (id) {
        await setCurrentWorkout(id);
      }
      if (active) {
        setIsResolving(false);
      }
    })();
    return (): void => {
      active = false;
      clearCurrentWorkout();
    };
  }, [id, setCurrentWorkout, clearCurrentWorkout]);

  const handleExerciseClick = (exerciseId: string): void => {
    if (!currentWorkout) {
      return;
    }

    const exercise = currentWorkout.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) {
      return;
    }

    if (exercise.completedSets >= exercise.sets) {
      return;
    }
    void updateWorkoutProgress(currentWorkout.id, exerciseId);

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
    if (!currentWorkout) {
      return;
    }

    const ok = await confirmDialog({
      title: 'Reset all progress?',
      description: 'All completed sets will be reset.',
      confirmationText: 'Reset',
      cancellationText: 'Cancel',
    });
    if (ok) {
      void resetAllProgress(currentWorkout.id);
    }
  };

  const calculateProgress = (): { totalExercises: number; completedExercises: number; overallProgress: number } => {
    if (!currentWorkout) {
      return { totalExercises: 0, completedExercises: 0, overallProgress: 0 };
    }

    const totalExercises = currentWorkout.exercises.length;
    const completedExercises = currentWorkout.exercises.filter(
      ex => ex.sets > 0 && ex.completedSets === ex.sets,
    ).length;
    const overallProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

    return { totalExercises, completedExercises, overallProgress };
  };

  const { totalExercises, completedExercises, overallProgress } = calculateProgress();

  useEffect((): void => {
    prevCompletedExercisesRef.current = null;
  }, [id]);

  useEffect((): void => {
    if (!currentWorkout || currentWorkout.id !== id) {
      return;
    }
    const prev = prevCompletedExercisesRef.current;
    if (totalExercises > 0 && prev !== null && prev < totalExercises && completedExercises === totalExercises) {
      fireWorkoutCompleteConfetti();
    }
    prevCompletedExercisesRef.current = completedExercises;
  }, [id, currentWorkout, completedExercises, totalExercises]);

  if (isResolving) {
    return null;
  }

  return (
    <WorkoutModePage
      currentWorkout={currentWorkout}
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
