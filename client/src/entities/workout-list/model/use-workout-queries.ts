import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createWorkoutList,
  deleteWorkoutList,
  fetchWorkoutList,
  fetchWorkoutLists,
  incrementExerciseProgress,
  resetWorkoutProgress,
  updateWorkoutList,
} from 'src/entities/workout-list/api';
import type { CreateWorkoutListDto, UpdateWorkoutListDto, WorkoutList } from 'src/entities/workout-list/model/types';
import { workoutQueryKeys } from 'src/entities/workout-list/model/workout-query-keys';

const patchWorkoutInLists = (lists: WorkoutList[], updated: WorkoutList): WorkoutList[] =>
  lists.map(list => (list.id === updated.id ? updated : list));

const applyProgressIncrement = (list: WorkoutList, exerciseId: string): WorkoutList => {
  const timestamp = new Date().toISOString();
  return {
    ...list,
    lastUsedAt: timestamp,
    exercises: list.exercises.map(exercise => {
      if (exercise.id !== exerciseId || exercise.completedSets >= exercise.sets) {
        return exercise;
      }
      return { ...exercise, completedSets: exercise.completedSets + 1 };
    }),
  };
};

const applyProgressReset = (list: WorkoutList): WorkoutList => ({
  ...list,
  exercises: list.exercises.map(exercise => ({ ...exercise, completedSets: 0 })),
});

export function useWorkoutListsQuery(enabled = true) {
  return useQuery<WorkoutList[]>({
    queryKey: workoutQueryKeys.lists,
    queryFn: fetchWorkoutLists,
    enabled,
  });
}

export function useWorkoutQuery(id: string, enabled = true) {
  return useQuery<WorkoutList | null>({
    queryKey: workoutQueryKeys.detail(id),
    queryFn: () => fetchWorkoutList(id),
    enabled: enabled && id.length > 0,
  });
}

export function useCreateWorkoutListMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateWorkoutListDto) => createWorkoutList(dto),
    onSuccess: created => {
      const lists = qc.getQueryData<WorkoutList[]>(workoutQueryKeys.lists);
      if (lists) {
        qc.setQueryData(workoutQueryKeys.lists, [...lists, created]);
      } else {
        void qc.invalidateQueries({ queryKey: workoutQueryKeys.lists });
      }
    },
  });
}

type UpdateWorkoutListVars = { id: string; dto: UpdateWorkoutListDto };

export function useUpdateWorkoutListMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: UpdateWorkoutListVars) => updateWorkoutList(id, dto),
    onSuccess: (updated, { id }) => {
      qc.setQueryData(workoutQueryKeys.detail(id), updated);
      const lists = qc.getQueryData<WorkoutList[]>(workoutQueryKeys.lists);
      if (lists) {
        qc.setQueryData(workoutQueryKeys.lists, patchWorkoutInLists(lists, updated));
      }
    },
  });
}

export function useDeleteWorkoutListMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWorkoutList(id),
    onSuccess: (_data, id) => {
      qc.setQueryData<WorkoutList[]>(workoutQueryKeys.lists, old => old?.filter(list => list.id !== id) ?? []);
      qc.removeQueries({ queryKey: workoutQueryKeys.detail(id) });
    },
  });
}

type UpdateProgressVars = { listId: string; exerciseId: string };

export function useUpdateWorkoutProgressMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, exerciseId }: UpdateProgressVars) => incrementExerciseProgress(listId, exerciseId),
    onMutate: async ({ listId, exerciseId }) => {
      await qc.cancelQueries({ queryKey: workoutQueryKeys.detail(listId) });
      await qc.cancelQueries({ queryKey: workoutQueryKeys.lists });

      const previousDetail = qc.getQueryData<WorkoutList | null>(workoutQueryKeys.detail(listId));
      const previousLists = qc.getQueryData<WorkoutList[]>(workoutQueryKeys.lists);

      if (previousDetail) {
        const optimistic = applyProgressIncrement(previousDetail, exerciseId);
        qc.setQueryData(workoutQueryKeys.detail(listId), optimistic);
        if (previousLists) {
          qc.setQueryData(workoutQueryKeys.lists, patchWorkoutInLists(previousLists, optimistic));
        }
      } else if (previousLists) {
        const list = previousLists.find(item => item.id === listId);
        if (list) {
          const optimistic = applyProgressIncrement(list, exerciseId);
          qc.setQueryData(workoutQueryKeys.lists, patchWorkoutInLists(previousLists, optimistic));
        }
      }

      return { previousDetail, previousLists };
    },
    onSuccess: (updated, { listId }) => {
      qc.setQueryData(workoutQueryKeys.detail(listId), updated);
      const lists = qc.getQueryData<WorkoutList[]>(workoutQueryKeys.lists);
      if (lists) {
        qc.setQueryData(workoutQueryKeys.lists, patchWorkoutInLists(lists, updated));
      }
    },
    onError: (_error, { listId }, context) => {
      if (context?.previousDetail !== undefined) {
        qc.setQueryData(workoutQueryKeys.detail(listId), context.previousDetail);
      }
      if (context?.previousLists) {
        qc.setQueryData(workoutQueryKeys.lists, context.previousLists);
      }
    },
  });
}

export function useResetWorkoutProgressMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (listId: string) => resetWorkoutProgress(listId),
    onMutate: async listId => {
      await qc.cancelQueries({ queryKey: workoutQueryKeys.detail(listId) });
      await qc.cancelQueries({ queryKey: workoutQueryKeys.lists });

      const previousDetail = qc.getQueryData<WorkoutList | null>(workoutQueryKeys.detail(listId));
      const previousLists = qc.getQueryData<WorkoutList[]>(workoutQueryKeys.lists);

      if (previousDetail) {
        const optimistic = applyProgressReset(previousDetail);
        qc.setQueryData(workoutQueryKeys.detail(listId), optimistic);
        if (previousLists) {
          qc.setQueryData(workoutQueryKeys.lists, patchWorkoutInLists(previousLists, optimistic));
        }
      } else if (previousLists) {
        const list = previousLists.find(item => item.id === listId);
        if (list) {
          const optimistic = applyProgressReset(list);
          qc.setQueryData(workoutQueryKeys.lists, patchWorkoutInLists(previousLists, optimistic));
        }
      }

      return { previousDetail, previousLists };
    },
    onSuccess: (updated, listId) => {
      qc.setQueryData(workoutQueryKeys.detail(listId), updated);
      const lists = qc.getQueryData<WorkoutList[]>(workoutQueryKeys.lists);
      if (lists) {
        qc.setQueryData(workoutQueryKeys.lists, patchWorkoutInLists(lists, updated));
      }
    },
    onError: (_error, listId, context) => {
      if (context?.previousDetail !== undefined) {
        qc.setQueryData(workoutQueryKeys.detail(listId), context.previousDetail);
      }
      if (context?.previousLists) {
        qc.setQueryData(workoutQueryKeys.lists, context.previousLists);
      }
    },
  });
}
