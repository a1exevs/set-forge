import type { WorkoutList } from '@entities';
import { FC, useEffect, useRef, useState } from 'react';

import WorkoutModePage from 'src/pages/workout-mode/ui/workout-mode-page';

type Props = {
  id: string;
  currentWorkout: WorkoutList | null;
  setCurrentWorkout: (id: string) => void;
  clearCurrentWorkout: () => void;
  updateWorkoutProgress: (listId: string, exerciseId: string) => void;
  resetAllProgress: (listId: string) => void;
};

const WorkoutModePageLogicLayer: FC<Props> = ({
  id,
  currentWorkout,
  setCurrentWorkout,
  clearCurrentWorkout,
  updateWorkoutProgress,
  resetAllProgress,
}) => {
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const lastTapRef = useRef<Record<string, number>>({});

  useEffect((): (() => void) => {
    if (id) {
      setCurrentWorkout(id);
    }
    return clearCurrentWorkout;
  }, [id, setCurrentWorkout, clearCurrentWorkout]);

  const handleExerciseClick = (exerciseId: string): void => {
    if (!currentWorkout) return;

    const exercise = currentWorkout.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    if (exercise.completedSets < exercise.sets) {
      updateWorkoutProgress(currentWorkout.id, exerciseId);

      if (exercise.completedSets + 1 === exercise.sets) {
        setJustCompleted(exerciseId);
        setTimeout((): void => setJustCompleted(null), 1000);
      }
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

  const handleResetAll = (): void => {
    if (!currentWorkout) return;

    if (confirm('Reset all progress?')) {
      resetAllProgress(currentWorkout.id);
    }
  };

  const calculateProgress = (): { totalExercises: number; completedExercises: number; overallProgress: number } => {
    if (!currentWorkout) {
      return { totalExercises: 0, completedExercises: 0, overallProgress: 0 };
    }

    const totalExercises = currentWorkout.exercises.length;
    const completedExercises = currentWorkout.exercises.filter(ex => ex.completedSets === ex.sets).length;
    const overallProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

    return { totalExercises, completedExercises, overallProgress };
  };

  const { totalExercises, completedExercises, overallProgress } = calculateProgress();

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
