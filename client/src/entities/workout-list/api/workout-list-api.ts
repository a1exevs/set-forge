import type {
  CreateWorkoutListDto,
  UpdateWorkoutListDto,
  WorkoutList,
} from 'src/entities/workout-list/model/types';
import { apiRequest, ApiRequestError } from 'src/shared/api/http-client';
import { ResultCodes } from 'src/shared/api/result-codes';

const BASE = '/workout-lists';

function unwrap<T>(res: { resultCode: number; data: T | null; messages: string[] }, fallbackMessage: string): T {
  if (res.resultCode !== ResultCodes.OK || res.data === null) {
    throw new Error(res.messages[0] ?? fallbackMessage);
  }
  return res.data;
}

export async function fetchWorkoutLists(): Promise<WorkoutList[]> {
  const res = await apiRequest<WorkoutList[]>(BASE, { method: 'GET', auth: true });
  return unwrap(res, 'Failed to load workout lists');
}

export async function fetchWorkoutList(id: string): Promise<WorkoutList | null> {
  try {
    const res = await apiRequest<WorkoutList>(`${BASE}/${id}`, { method: 'GET', auth: true });
    if (res.resultCode !== ResultCodes.OK || !res.data) {
      return null;
    }
    return res.data;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createWorkoutList(dto: CreateWorkoutListDto): Promise<WorkoutList> {
  const res = await apiRequest<WorkoutList>(BASE, { method: 'POST', auth: true, body: dto });
  return unwrap(res, 'Failed to create workout list');
}

export async function updateWorkoutList(id: string, dto: UpdateWorkoutListDto): Promise<WorkoutList> {
  const res = await apiRequest<WorkoutList>(`${BASE}/${id}`, { method: 'PUT', auth: true, body: dto });
  return unwrap(res, 'Failed to update workout list');
}

export async function deleteWorkoutList(id: string): Promise<void> {
  const res = await apiRequest<{ result: boolean }>(`${BASE}/${id}`, { method: 'DELETE', auth: true });
  unwrap(res, 'Failed to delete workout list');
}

export async function incrementExerciseProgress(listId: string, exerciseId: string): Promise<WorkoutList> {
  const res = await apiRequest<WorkoutList>(`${BASE}/${listId}/exercises/${exerciseId}/progress`, {
    method: 'PATCH',
    auth: true,
  });
  return unwrap(res, 'Failed to update progress');
}

export async function resetWorkoutProgress(listId: string): Promise<WorkoutList> {
  const res = await apiRequest<WorkoutList>(`${BASE}/${listId}/reset`, { method: 'POST', auth: true });
  return unwrap(res, 'Failed to reset progress');
}
