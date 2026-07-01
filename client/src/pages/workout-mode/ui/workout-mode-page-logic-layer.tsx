import type { WorkoutSession } from '@entities';
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
  session: WorkoutSession | null | undefined;
  incrementProgress: (sessionId: string, exerciseId: string) => Promise<void>;
  finishSession: (sessionId: string) => Promise<void>;
};

const WorkoutModePageLogicLayer: FC<Props> = ({ session, incrementProgress, finishSession }) => {
  const confirmDialog = useConfirm();
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const lastTapRef = useRef<Record<string, number>>({});
  const prevCompletedExercisesRef = useRef<number | null>(null);
  const confettiFiredRef = useRef(false);

  const isFinished = session?.status === 'completed';

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

    const ok = await confirmDialog({
      title: 'Finish workout?',
      description: 'The session will be marked as completed and can no longer be edited.',
      confirmationText: 'Finish',
      cancellationText: 'Cancel',
    });
    if (ok) {
      try {
        await finishSession(session.id);
        if (!confettiFiredRef.current) {
          confettiFiredRef.current = true;
          fireWorkoutCompleteConfetti();
        }
      } catch {
        // TODO: Support common toaster
      }
    }
  };

  const calculateProgress = (): { totalExercises: number; completedExercises: number; overallProgress: number } => {
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
    if (!session) {
      return;
    }
    const prev = prevCompletedExercisesRef.current;
    const allComplete = totalExercises > 0 && completedExercises === totalExercises;
    // Celebrate once per session, in two situations:
    //  - the user completes the last set while training (transition prev < total -> all done);
    //  - the session is already fully complete on entry (e.g. the list was edited mid-session and
    //    resynced to all-complete). Resync never auto-finishes, so the session is still active here
    //    and we finish it explicitly to land on the completed state with its celebration.
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
            // TODO: Support common toaster — user can retry via Finish workout
            confettiFiredRef.current = false;
          }
        })();
      } else {
        celebrate();
      }
    }
    prevCompletedExercisesRef.current = completedExercises;
  }, [session, completedExercises, totalExercises, finishSession]);

  if (session === undefined) {
    return null;
  }

  return (
    <WorkoutModePage
      session={session}
      justCompleted={justCompleted}
      isFinished={isFinished}
      totalExercises={totalExercises}
      completedExercises={completedExercises}
      overallProgress={overallProgress}
      onTap={handleTap}
      onFinish={handleFinish}
    />
  );
};

export default WorkoutModePageLogicLayer;
