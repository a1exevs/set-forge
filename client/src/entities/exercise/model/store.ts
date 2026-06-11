import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@shared';

import type { CreateExerciseDto, Exercise } from 'src/entities/exercise/model/types';

interface ExerciseState {
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
  addExercise: (dto: CreateExerciseDto) => void;
  removeExercise: (id: string) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  setExercises: (exercises: Exercise[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const useExerciseStoreBase = create<ExerciseState>()(
  devtools(
    immer(set => ({
      exercises: [],
      isLoading: false,
      error: null,

      addExercise: dto =>
        set(state => {
          const newExercise: Exercise = {
            id: crypto.randomUUID(),
            ...dto,
            createdAt: new Date().toISOString(),
          };
          state.exercises.push(newExercise);
        }),

      removeExercise: id =>
        set(state => {
          state.exercises = state.exercises.filter(ex => ex.id !== id);
        }),

      updateExercise: (id, updates) =>
        set(state => {
          const exercise = state.exercises.find(ex => ex.id === id);
          if (exercise) {
            Object.assign(exercise, updates);
          }
        }),

      setExercises: exercises =>
        set(state => {
          state.exercises = exercises;
        }),

      setLoading: isLoading =>
        set(state => {
          state.isLoading = isLoading;
        }),

      setError: error =>
        set(state => {
          state.error = error;
        }),
    })),
    { name: 'ExerciseStore' },
  ),
);

export const useExerciseStore = createSelectors(useExerciseStoreBase);
