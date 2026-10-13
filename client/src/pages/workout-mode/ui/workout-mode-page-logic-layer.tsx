import { FC, useEffect, useRef, useState } from 'react';

import type { WorkoutList } from '@entities/workout-list';
import { countCompletedExercises, isSessionFullyComplete, type WorkoutSession } from '@entities/workout-session';
import { hasRemainingSets } from '@entities/workout-session-exercise';
import { toastError, useConfirm, useLoadingPhase, useProgress } from '@shared/lib';

import WorkoutModePage from './workout-mode-page';
import { fireWorkoutCompleteConfetti } from '../lib/fire-workout-complete-confetti';

type Props = {
  workoutList: WorkoutList | null | undefined;
  session: WorkoutSession | null;
  startSession: (workoutListId: string) => Promise<void>;
  incrementProgress: (sessionId: string, exerciseId: string) => Promise<WorkoutSession>;
  finishSession: (sessionId: string) => Promise<void>;
  discardSession: (sessionId: string) => Promise<void>;
};

const WorkoutModePageLogicLayer: FC<Props> = ({
  workoutList,
  session,
  startSession,
  incrementProgress,
  finishSession,
  discardSession,
}) => {
  const confirmDialog = useConfirm();
  const { run, progressOf } = useProgress<'start'>();
  const loadingPhase = useLoadingPhase(workoutList === undefined);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const lastTapRef = useRef<Record<string, number>>({});
  const confettiFiredRef = useRef(false);
  /** First observation of this sessionId — used only for the resync-all-complete-on-entry edge. */
  const entryHandledForSessionRef = useRef<string | null>(null);

  const startProgress = progressOf('start');
  // The started session waits for the hold of Start's progress, so the preview never blinks away under it.
  const phase = session != null && startProgress === 'idle' ? 'training' : 'preview';
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
      await run('start', () => startSession(workoutList.id));
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

    if (!hasRemainingSets(exercise)) {
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
      onConfirm: async (): Promise<void> => {
        try {
          await finishSession(session.id);
        } catch (error: unknown) {
          toastError(error, 'Failed to finish workout session');
          throw error;
        }
      },
      onAlternate: async (): Promise<void> => {
        try {
          await discardSession(session.id);
        } catch (error: unknown) {
          toastError(error, 'Failed to discard workout session');
          throw error;
        }
      },
    });

    if (result === 'confirm') {
      celebrateOnce();
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
    const completedExercises = countCompletedExercises(session);
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

  return (
    <WorkoutModePage
      loadingPhase={loadingPhase}
      phase={phase}
      workoutList={workoutList ?? null}
      session={session}
      justCompleted={justCompleted}
      isFinished={isFinished}
      totalExercises={totalExercises}
      completedExercises={completedExercises}
      overallProgress={overallProgress}
      startProgress={startProgress}
      onTap={handleTap}
      onStart={handleStart}
      onFinish={handleFinish}
    />
  );
};

export default WorkoutModePageLogicLayer;
