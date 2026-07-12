import type { WorkoutList, WorkoutSession } from '@entities';
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
  workoutList: WorkoutList | null | undefined;
  session: WorkoutSession | null;
  isStarting: boolean;
  startSession: (workoutListId: string) => Promise<void>;
  incrementProgress: (sessionId: string, exerciseId: string) => Promise<void>;
  finishSession: (sessionId: string) => Promise<void>;
  discardSession: (sessionId: string) => Promise<void>;
};

const WorkoutModePageLogicLayer: FC<Props> = ({
  workoutList,
  session,
  isStarting,
  startSession,
  incrementProgress,
  finishSession,
  discardSession,
}) => {
  const confirmDialog = useConfirm();
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const lastTapRef = useRef<Record<string, number>>({});
  const prevCompletedExercisesRef = useRef<number | null>(null);
  const confettiFiredRef = useRef(false);

  const phase = session != null ? 'training' : 'preview';
  const isFinished = session?.status === 'completed';

  const handleStart = async (): Promise<void> => {
    if (!workoutList || session != null) {
      return;
    }

    try {
      await startSession(workoutList.id);
    } catch {
      // TODO: Support common toaster
    }
  };

  const handleExerciseClick = (exerciseId: string): void => {
    if (!session || isFinished) {
      return;
    }

    const exercise = session.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) {
      return;
    }

    if (exercise.completedSets >= exercise.sets) {
      return;
    }
    void incrementProgress(session.id, exerciseId);

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

  const handleFinish = async (): Promise<void> => {
    if (!session || isFinished) {
      return;
    }

    const result = await confirmDialog({
      title: 'Finish workout?',
      description:
        'Finish saves this session to history. Discard deletes this active session without saving. Cancel keeps the workout open.',
      confirmationText: 'Finish',
      alternateText: 'Discard',
      cancellationText: 'Cancel',
    });

    if (result === 'confirm') {
      try {
        await finishSession(session.id);
        if (!confettiFiredRef.current) {
          confettiFiredRef.current = true;
          fireWorkoutCompleteConfetti();
        }
      } catch {
        // TODO: Support common toaster
      }
      return;
    }

    if (result === 'alternate') {
      try {
        await discardSession(session.id);
      } catch {
        // TODO: Support common toaster
      }
    }
  };

  const calculateProgress = (): { totalExercises: number; completedExercises: number; overallProgress: number } => {
    if (phase === 'preview') {
      const totalExercises = workoutList?.exercises.length ?? 0;
      return { totalExercises, completedExercises: 0, overallProgress: 0 };
    }

    if (!session) {
      return { totalExercises: 0, completedExercises: 0, overallProgress: 0 };
    }

    const totalExercises = session.exercises.length;
    const completedExercises = session.exercises.filter(ex => ex.sets > 0 && ex.completedSets === ex.sets).length;
    const overallProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

    return { totalExercises, completedExercises, overallProgress };
  };

  const { totalExercises, completedExercises, overallProgress } = calculateProgress();

  const sessionId = session?.id ?? null;

  useEffect((): void => {
    prevCompletedExercisesRef.current = null;
    confettiFiredRef.current = false;
  }, [sessionId]);

  useEffect((): void => {
    if (!session || phase !== 'training') {
      return;
    }
    const prev = prevCompletedExercisesRef.current;
    const allComplete = totalExercises > 0 && completedExercises === totalExercises;
    const isTransitionComplete = prev !== null && prev < totalExercises && allComplete;
    const isLoadedComplete = prev === null && allComplete && session.status === 'active';

    if (!confettiFiredRef.current && (isTransitionComplete || isLoadedComplete)) {
      const celebrate = (): void => {
        confettiFiredRef.current = true;
        fireWorkoutCompleteConfetti();
      };

      if (session.status === 'active') {
        void (async (): Promise<void> => {
          try {
            await finishSession(session.id);
            celebrate();
          } catch {
            confettiFiredRef.current = false;
          }
        })();
      } else {
        celebrate();
      }
    }
    prevCompletedExercisesRef.current = completedExercises;
  }, [session, phase, completedExercises, totalExercises, finishSession]);

  if (workoutList === undefined) {
    return null;
  }

  return (
    <WorkoutModePage
      phase={phase}
      workoutList={workoutList}
      session={session}
      justCompleted={justCompleted}
      isFinished={isFinished}
      totalExercises={totalExercises}
      completedExercises={completedExercises}
      overallProgress={overallProgress}
      isStarting={isStarting}
      onTap={handleTap}
      onStart={handleStart}
      onFinish={handleFinish}
    />
  );
};

export default WorkoutModePageLogicLayer;
