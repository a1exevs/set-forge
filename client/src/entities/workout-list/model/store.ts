import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@shared';

import {
  createWorkoutList as apiCreateWorkoutList,
  deleteWorkoutList as apiDeleteWorkoutList,
  updateWorkoutList as apiUpdateWorkoutList,
  fetchWorkoutList,
  fetchWorkoutLists,
  incrementExerciseProgress,
  resetWorkoutProgress,
} from 'src/entities/workout-list/api';
import type {
  CreateWorkoutListDto,
  UpdateWorkoutListDto,
  WorkoutList,
} from 'src/entities/workout-list/model/types';

const resolveErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

interface WorkoutListState {
  workoutLists: WorkoutList[];
  currentWorkout: WorkoutList | null;
  isLoading: boolean;
  error: string | null;

  loadLists: () => Promise<void>;
  addWorkoutList: (dto: CreateWorkoutListDto) => Promise<boolean>;
  updateWorkoutList: (id: string, dto: UpdateWorkoutListDto) => Promise<boolean>;
  deleteWorkoutList: (id: string) => Promise<void>;
  updateWorkoutProgress: (listId: string, exerciseId: string) => Promise<void>;
  setCurrentWorkout: (id: string) => Promise<void>;
  clearCurrentWorkout: () => void;
  resetExerciseProgress: (listId: string, exerciseId: string) => void;
  resetAllProgress: (listId: string) => Promise<void>;
  /** Retained for backward compatibility after the localStorage → API migration; always 0. */
  getUsagePercentageAsync: () => Promise<number>;
}

const useWorkoutListStoreBase = create<WorkoutListState>()(
  devtools(
    immer((set, get) => ({
      workoutLists: [],
      currentWorkout: null,
      isLoading: false,
      error: null,

      loadLists: async () => {
        set(state => {
          state.isLoading = true;
        });
        try {
          const lists = await fetchWorkoutLists();
          set(state => {
            state.error = null;
            state.workoutLists = lists;
            state.isLoading = false;
          });
        } catch (error) {
          set(state => {
            state.error = resolveErrorMessage(error, 'Failed to load workout lists');
            state.isLoading = false;
          });
        }
      },

      addWorkoutList: async dto => {
        try {
          const created = await apiCreateWorkoutList(dto);
          set(state => {
            state.error = null;
            state.workoutLists.push(created);
          });
          return true;
        } catch (error) {
          set(state => {
            state.error = resolveErrorMessage(error, 'Failed to save workout list');
          });
          return false;
        }
      },

      updateWorkoutList: async (id, dto) => {
        try {
          const updated = await apiUpdateWorkoutList(id, dto);
          set(state => {
            state.error = null;
            const idx = state.workoutLists.findIndex(l => l.id === id);
            if (idx >= 0) {
              state.workoutLists[idx] = updated;
            }
            if (state.currentWorkout?.id === id) {
              state.currentWorkout = updated;
            }
          });
          return true;
        } catch (error) {
          set(state => {
            state.error = resolveErrorMessage(error, 'Failed to update workout list');
          });
          return false;
        }
      },

      deleteWorkoutList: async id => {
        try {
          await apiDeleteWorkoutList(id);
          set(state => {
            state.error = null;
            state.workoutLists = state.workoutLists.filter(list => list.id !== id);
            if (state.currentWorkout?.id === id) {
              state.currentWorkout = null;
            }
          });
        } catch (error) {
          set(state => {
            state.error = resolveErrorMessage(error, 'Failed to delete workout list');
          });
        }
      },

      updateWorkoutProgress: async (listId, exerciseId) => {
        const timestamp = new Date().toISOString();
        // Optimistic update so double-tap feels instant; the server clamps identically.
        set(state => {
          const list = state.workoutLists.find(l => l.id === listId);
          if (list) {
            const exercise = list.exercises.find(ex => ex.id === exerciseId);
            if (exercise && exercise.completedSets < exercise.sets) {
              exercise.completedSets += 1;
            }
            list.lastUsedAt = timestamp;
          }
          if (state.currentWorkout?.id === listId) {
            const currentExercise = state.currentWorkout.exercises.find(ex => ex.id === exerciseId);
            if (currentExercise && currentExercise.completedSets < currentExercise.sets) {
              currentExercise.completedSets += 1;
            }
            state.currentWorkout.lastUsedAt = timestamp;
          }
        });

        try {
          await incrementExerciseProgress(listId, exerciseId);
          set(state => {
            state.error = null;
          });
        } catch (error) {
          set(state => {
            state.error = resolveErrorMessage(error, 'Failed to update progress');
          });
          await get().setCurrentWorkout(listId);
        }
      },

      setCurrentWorkout: async id => {
        try {
          const list = await fetchWorkoutList(id);
          set(state => {
            state.error = null;
            state.currentWorkout = list ?? null;
          });
        } catch (error) {
          set(state => {
            state.error = resolveErrorMessage(error, 'Failed to load workout list');
            state.currentWorkout = null;
          });
        }
      },

      clearCurrentWorkout: () => {
        set(state => {
          state.currentWorkout = null;
        });
      },

      resetExerciseProgress: (listId, exerciseId) => {
        // Local-only optimistic reset (no dedicated API endpoint); not used by current UI.
        set(state => {
          const list = state.workoutLists.find(l => l.id === listId);
          const exercise = list?.exercises.find(ex => ex.id === exerciseId);
          if (exercise) {
            exercise.completedSets = 0;
          }
          if (state.currentWorkout?.id === listId) {
            const currentExercise = state.currentWorkout.exercises.find(ex => ex.id === exerciseId);
            if (currentExercise) {
              currentExercise.completedSets = 0;
            }
          }
        });
      },

      resetAllProgress: async listId => {
        // Optimistic reset for instant progress-bar animation; server is the source of truth.
        set(state => {
          const list = state.workoutLists.find(l => l.id === listId);
          if (list) {
            list.exercises.forEach(exercise => {
              exercise.completedSets = 0;
            });
          }
          if (state.currentWorkout?.id === listId) {
            state.currentWorkout.exercises.forEach(exercise => {
              exercise.completedSets = 0;
            });
          }
        });

        try {
          await resetWorkoutProgress(listId);
          set(state => {
            state.error = null;
          });
        } catch (error) {
          set(state => {
            state.error = resolveErrorMessage(error, 'Failed to reset progress');
          });
          await get().setCurrentWorkout(listId);
        }
      },

      getUsagePercentageAsync: () => Promise.resolve(0),
    })),
    { name: 'WorkoutListStore' },
  ),
);

export const useWorkoutListStore = createSelectors(useWorkoutListStoreBase);
