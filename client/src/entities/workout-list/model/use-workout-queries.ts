import {
  useMutation,
  type UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';

import type {
  CreateWorkoutListDto,
  ImportWorkoutListsResult,
  UpdateWorkoutListDto,
  WorkoutList,
  WorkoutListsExportFile,
} from './workout-list';
import { workoutQueryKeys } from './workout-query-keys';
import {
  createWorkoutList,
  deleteWorkoutList,
  exportAllWorkoutLists,
  fetchWorkoutList,
  fetchWorkoutLists,
  importWorkoutLists,
  updateWorkoutList,
} from '../api/workout-list-api';

const patchWorkoutInLists = (lists: WorkoutList[], updated: WorkoutList): WorkoutList[] =>
  lists.map(list => (list.id === updated.id ? updated : list));

export function useWorkoutListsQuery(enabled = true): UseQueryResult<WorkoutList[]> {
  return useQuery<WorkoutList[]>({
    queryKey: workoutQueryKeys.lists,
    queryFn: fetchWorkoutLists,
    enabled,
  });
}

export function useWorkoutQuery(id: string, enabled = true): UseQueryResult<WorkoutList | null> {
  return useQuery<WorkoutList | null>({
    queryKey: workoutQueryKeys.detail(id),
    queryFn: () => fetchWorkoutList(id),
    enabled: enabled && id.length > 0,
  });
}

export function useCreateWorkoutListMutation(): UseMutationResult<WorkoutList, Error, CreateWorkoutListDto> {
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

export function useUpdateWorkoutListMutation(): UseMutationResult<WorkoutList, Error, UpdateWorkoutListVars> {
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

export function useDeleteWorkoutListMutation(): UseMutationResult<void, Error, string> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWorkoutList(id),
    onSuccess: (_data, id) => {
      qc.setQueryData<WorkoutList[]>(workoutQueryKeys.lists, old => old?.filter(list => list.id !== id) ?? []);
      qc.removeQueries({ queryKey: workoutQueryKeys.detail(id) });
    },
  });
}

export function useExportAllWorkoutListsMutation(): UseMutationResult<WorkoutListsExportFile, Error, void> {
  return useMutation({
    mutationFn: () => exportAllWorkoutLists(),
  });
}

export function useImportWorkoutListsMutation(): UseMutationResult<
  ImportWorkoutListsResult,
  Error,
  WorkoutListsExportFile
> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (file: WorkoutListsExportFile) => importWorkoutLists(file),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: workoutQueryKeys.lists });
    },
  });
}
