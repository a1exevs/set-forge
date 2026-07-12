import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createWorkoutList,
  deleteWorkoutList,
  exportAllWorkoutLists,
  fetchWorkoutList,
  fetchWorkoutLists,
  importWorkoutLists,
  updateWorkoutList,
} from 'src/entities/workout-list/api';
import type {
  CreateWorkoutListDto,
  UpdateWorkoutListDto,
  WorkoutList,
  WorkoutListsExportFile,
} from 'src/entities/workout-list/model/types';
import { workoutQueryKeys } from 'src/entities/workout-list/model/workout-query-keys';

const patchWorkoutInLists = (lists: WorkoutList[], updated: WorkoutList): WorkoutList[] =>
  lists.map(list => (list.id === updated.id ? updated : list));

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

export function useExportAllWorkoutListsMutation() {
  return useMutation({
    mutationFn: () => exportAllWorkoutLists(),
  });
}

export function useImportWorkoutListsMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (file: WorkoutListsExportFile) => importWorkoutLists(file),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: workoutQueryKeys.lists });
    },
  });
}
