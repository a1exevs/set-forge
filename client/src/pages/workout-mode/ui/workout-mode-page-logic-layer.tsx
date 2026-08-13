import type { WorkoutList, WorkoutSession } from '@entities';
import confetti from 'canvas-confetti';
import { FC, useEffect, useRef, useState } from 'react';

import { toastError, useConfirm } from '@shared';

import WorkoutModePage from 'src/pages/workout-mode/ui/workout-mode-page';

const fireWorkoutCompleteConfetti = (): void => {
  void confetti({ particleCount: 110, spread: 72, origin: { y: 0.62 } });
  void confetti({ particleCount: 70, angle: 55, spread: 58, origin: { x: 0, y: 0.62 } });
  void confetti({ particleCount: 70, angle: 125, spread: 58, origin: { x: 1, y: 0.62 } });
};

const isSessionFullyComplete = (session: WorkoutSession): boolean =>
  session.exercises.length > 0 &&
  session.exercises.every(exercise => exercise.sets > 0 && exercise.completedSets === exercise.sets);

type Props = {
  workoutList: WorkoutList | null | undefined;
  session: WorkoutSession | null;
  isStarting: boolean;
  startSession: (workoutListId: string) => Promise<void>;
  incrementProgress: (sessionId: string, exerciseId: string) => Promise<WorkoutSession>;
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
  const confettiFiredRef = useRef(false);
  /** First observation of this sessionId — used only for the resync-all-complete-on-entry edge. */
  const entryHandledForSessionRef = useRef<string | null>(null);

  const phase = session != null ? 'training' : 'preview';
  const isFinished = session?.status === 'completed';

  const celebrateOnce = (): void => {
    if (confettiFiredRef.current) {
      return;
    }
    confettiFiredRef.current = true;
    fireWorkoutCompleteConfetti();
  };

  const handleStart = async (): Promise<void> => {
    if (!workoutList || session != null) {
      return;
    }

    try {
      await startSession(workoutList.id);
    } catch (error: unknown) {
      toastError(error, 'Failed to start workout session');
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

    if (exercise.completedSets + 1 === exercise.sets) {
      setJustCompleted(exerciseId);
      setTimeout((): void => setJustCompleted(null), 1000);
    }

    // Server auto-finishes on last set; do not call finishSession here (races with progress).
    void (async (): Promise<void> => {
      try {
        const updated = await incrementProgress(session.id, exerciseId);
        if (updated.status === 'completed') {
          celebrateOnce();
        }
      } catch (error: unknown) {
        toastError(error, 'Failed to update session progress');
      }
    })();
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
        celebrateOnce();
      } catch (error: unknown) {
        toastError(error, 'Failed to finish workout session');
      }
      return;
    }

    if (result === 'alternate') {
      try {
        await discardSession(session.id);
      } catch (error: unknown) {
        toastError(error, 'Failed to discard workout session');
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
    confettiFiredRef.current = false;
    entryHandledForSessionRef.current = null;
  }, [sessionId]);

  // Resync edge only: first time we see this session, if it is already fully complete while still
  // active, finish once + confetti. Normal last-set completion is handled by progress auto-finish.
  useEffect((): void => {
    if (!session || phase !== 'training') {
      return;
    }
    if (entryHandledForSessionRef.current === session.id) {
      return;
    }
    entryHandledForSessionRef.current = session.id;

    if (session.status !== 'active' || !isSessionFullyComplete(session)) {
      return;
    }

    void (async (): Promise<void> => {
      try {
        await finishSession(session.id);
        celebrateOnce();
      } catch {
        entryHandledForSessionRef.current = null;
      }
    })();
  }, [session, phase, finishSession]);

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
