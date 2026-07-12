import { apiRequest, ApiRequestError, ResultCodes } from '@shared';

import type { WorkoutHistoryPage, WorkoutSession } from 'src/entities/workout-session/model/types';

const BASE = '/workout-sessions';

function unwrap<T>(res: { resultCode: number; data: T | null; messages: string[] }, fallbackMessage: string): T {
  if (res.resultCode !== ResultCodes.OK || res.data === null) {
    throw new Error(res.messages[0] ?? fallbackMessage);
  }
  return res.data;
}

/** Idempotent: resumes the active session for the list or creates a fresh one. */
export async function startWorkoutSession(workoutListId: string): Promise<WorkoutSession> {
  const res = await apiRequest<WorkoutSession>(BASE, {
    method: 'POST',
    auth: true,
    body: { workoutListId },
  });
  return unwrap(res, 'Failed to start workout session');
}

export async function fetchActiveWorkoutSession(workoutListId: string): Promise<WorkoutSession | null> {
  try {
    const res = await apiRequest<WorkoutSession>(`${BASE}/active?workoutListId=${workoutListId}`, {
      method: 'GET',
      auth: true,
    });
    if (res.resultCode !== ResultCodes.OK) {
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

export async function incrementSessionProgress(sessionId: string, exerciseId: string): Promise<WorkoutSession> {
  const res = await apiRequest<WorkoutSession>(`${BASE}/${sessionId}/exercises/${exerciseId}/progress`, {
    method: 'PATCH',
    auth: true,
  });
  return unwrap(res, 'Failed to update session progress');
}

export async function finishWorkoutSession(sessionId: string): Promise<WorkoutSession> {
  const res = await apiRequest<WorkoutSession>(`${BASE}/${sessionId}/finish`, { method: 'POST', auth: true });
  return unwrap(res, 'Failed to finish workout session');
}

export async function resyncWorkoutSession(sessionId: string): Promise<WorkoutSession> {
  const res = await apiRequest<WorkoutSession>(`${BASE}/${sessionId}/resync`, { method: 'POST', auth: true });
  return unwrap(res, 'Failed to resync workout session');
}

export async function discardWorkoutSession(sessionId: string): Promise<void> {
  const res = await apiRequest<{ result: boolean }>(`${BASE}/${sessionId}`, { method: 'DELETE', auth: true });
  unwrap(res, 'Failed to discard workout session');
}

/** Paginated completed-session history, newest first. */
export async function fetchWorkoutHistory(limit: number, offset: number): Promise<WorkoutHistoryPage> {
  const res = await apiRequest<WorkoutHistoryPage>(`${BASE}?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    auth: true,
  });
  return unwrap(res, 'Failed to load workout history');
}
