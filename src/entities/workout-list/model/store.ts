import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '@shared';

import { workoutListStorage } from 'src/entities/workout-list/api';
import type {
  CreateWorkoutListDto,
  UpdateWorkoutListDto,
  WorkoutExercise,
  WorkoutList,
} from 'src/entities/workout-list/model/types';

interface WorkoutListState {
  workoutLists: WorkoutList[];
  currentWorkout: WorkoutList | null;
  isLoading: boolean;
  error: string | null;

  loadFromStorage: () => void;
  addWorkoutList: (dto: CreateWorkoutListDto) => boolean;
  updateWorkoutList: (id: string, dto: UpdateWorkoutListDto) => boolean;
  deleteWorkoutList: (id: string) => void;
  updateWorkoutProgress: (listId: string, exerciseId: string) => void;
  setCurrentWorkout: (id: string) => void;
  clearCurrentWorkout: () => void;
  resetExerciseProgress: (listId: string, exerciseId: string) => void;
  resetAllProgress: (listId: string) => void;
  getUsagePercentageAsync: () => Promise<number>;
}

const useWorkoutListStoreBase = create<WorkoutListState>()(
  devtools(
    immer(set => ({
      workoutLists: [],
      currentWorkout: null,
      isLoading: false,
      error: null,

      loadFromStorage: () => {
        try {
          const lists = workoutListStorage.getAllLists();
          set(state => {
            state.error = null;
            state.workoutLists = lists;
            state.isLoading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to load workout lists';
            state.isLoading = false;
          });
        }
      },

      addWorkoutList: dto => {
        const newList: WorkoutList = {
          id: crypto.randomUUID(),
          name: dto.name,
          description: dto.description,
          exercises: dto.exercises.map(ex => ({
            ...ex,
            id: crypto.randomUUID(),
            completedSets: 0,
          })),
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
        };

        try {
          workoutListStorage.saveList(newList);
          set(state => {
            state.error = null;
            state.workoutLists.push(newList);
          });
          return true;
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to save workout list';
          });
          return false;
        }
      },

      updateWorkoutList: (id, dto) => {
        const existing = workoutListStorage.getList(id);
        if (!existing) {
          set(state => {
            state.error = 'Workout list not found';
          });
          return false;
        }
        const exercises: WorkoutExercise[] = dto.exercises.map(ex => {
          if (ex.id !== undefined && ex.completedSets !== undefined) {
            return {
              id: ex.id,
              name: ex.name,
              muscleGroup: ex.muscleGroup,
              weight: ex.weight,
              reps: ex.reps,
              sets: ex.sets,
              completedSets: ex.completedSets,
            };
          }
          return {
            id: crypto.randomUUID(),
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            weight: ex.weight,
            reps: ex.reps,
            sets: ex.sets,
            completedSets: 0,
          };
        });

        const updated: WorkoutList = {
          ...existing,
          name: dto.name,
          description: dto.description,
          exercises,
        };

        try {
          workoutListStorage.saveList(updated);
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
            state.error = error instanceof Error ? error.message : 'Failed to update workout list';
          });
          return false;
        }
      },

      deleteWorkoutList: id => {
        try {
          workoutListStorage.deleteList(id);
          set(state => {
            state.error = null;
            state.workoutLists = state.workoutLists.filter(list => list.id !== id);
            if (state.currentWorkout?.id === id) {
              state.currentWorkout = null;
            }
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to delete workout list';
          });
        }
      },

      updateWorkoutProgress: (listId, exerciseId) => {
        set(state => {
          const list = state.workoutLists.find(l => l.id === listId);
          if (!list) {
            return;
          }

          const exercise = list.exercises.find(ex => ex.id === exerciseId);
          if (!exercise) {
            return;
          }

          if (exercise.completedSets < exercise.sets) {
            exercise.completedSets += 1;
          }

          list.lastUsedAt = new Date().toISOString();

          if (state.currentWorkout?.id === listId) {
            const currentExercise = state.currentWorkout.exercises.find(ex => ex.id === exerciseId);
            if (currentExercise && currentExercise.completedSets < currentExercise.sets) {
              currentExercise.completedSets += 1;
            }
            state.currentWorkout.lastUsedAt = list.lastUsedAt;
          }

          try {
            workoutListStorage.saveList(list);
            state.error = null;
          } catch (error) {
            state.error = error instanceof Error ? error.message : 'Failed to update progress';
          }
        });
      },

      setCurrentWorkout: id => {
        const list = workoutListStorage.getList(id);
        set(state => {
          state.currentWorkout = list ?? null;
        });
      },

      clearCurrentWorkout: () => {
        set(state => {
          state.currentWorkout = null;
        });
      },

      resetExerciseProgress: (listId, exerciseId) => {
        set(state => {
          const list = state.workoutLists.find(l => l.id === listId);
          if (!list) {
            return;
          }

          const exercise = list.exercises.find(ex => ex.id === exerciseId);
          if (exercise) {
            exercise.completedSets = 0;
          }

          if (state.currentWorkout?.id === listId) {
            const currentExercise = state.currentWorkout.exercises.find(ex => ex.id === exerciseId);
            if (currentExercise) {
              currentExercise.completedSets = 0;
            }
          }

          try {
            workoutListStorage.saveList(list);
            state.error = null;
          } catch (error) {
            state.error = error instanceof Error ? error.message : 'Failed to reset progress';
          }
        });
      },

      resetAllProgress: listId => {
        set(state => {
          const list = state.workoutLists.find(l => l.id === listId);
          if (!list) {
            return;
          }

          list.exercises.forEach(exercise => {
            exercise.completedSets = 0;
          });

          if (state.currentWorkout?.id === listId) {
            state.currentWorkout.exercises.forEach(exercise => {
              exercise.completedSets = 0;
            });
          }

          try {
            workoutListStorage.saveList(list);
            state.error = null;
          } catch (error) {
            state.error = error instanceof Error ? error.message : 'Failed to reset progress';
          }
        });
      },
      getUsagePercentageAsync: () => {
        return workoutListStorage.getUsagePercentageAsync();
      },
    })),
    { name: 'WorkoutListStore' },
  ),
);

export const useWorkoutListStore = createSelectors(useWorkoutListStoreBase);
