import {
  createWorkoutList,
  deleteWorkoutList,
  fetchWorkoutList,
  fetchWorkoutLists,
  updateWorkoutList,
} from 'src/entities/workout-list/api/workout-list-api';
import { apiRequest, ApiRequestError } from 'src/shared/api/http-client';

jest.mock('src/shared/api/http-client', () => {
  const actual = jest.requireActual('src/shared/api/http-client');
  return { ...actual, apiRequest: jest.fn() };
});

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

const okEnvelope = <T>(data: T) => ({ data, messages: [], fieldsErrors: [], resultCode: 0 });

const LIST = {
  id: 'list-1',
  name: 'Push Day',
  description: 'chest',
  exercises: [{ id: 'ex-1', name: 'Bench', muscleGroup: 'chest' as const, weight: 60, reps: 10, sets: 3 }],
  createdAt: '2026-06-03T12:00:00.000Z',
  lastUsedAt: null,
};

describe('workout-list-api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchWorkoutLists requests the collection with auth', async () => {
    mockedApiRequest.mockResolvedValue(okEnvelope([LIST]));

    const result = await fetchWorkoutLists();

    expect(mockedApiRequest).toHaveBeenCalledWith('/workout-lists', { method: 'GET', auth: true });
    expect(result).toEqual([LIST]);
  });

  it('fetchWorkoutList returns the list on success', async () => {
    mockedApiRequest.mockResolvedValue(okEnvelope(LIST));

    const result = await fetchWorkoutList('list-1');

    expect(mockedApiRequest).toHaveBeenCalledWith('/workout-lists/list-1', { method: 'GET', auth: true });
    expect(result).toEqual(LIST);
  });

  it('fetchWorkoutList returns null on a 404 ApiRequestError', async () => {
    mockedApiRequest.mockRejectedValue(
      new ApiRequestError(404, { data: null, messages: ['Not found'], fieldsErrors: [], resultCode: 1 }),
    );

    const result = await fetchWorkoutList('missing');

    expect(result).toBeNull();
  });

  it('fetchWorkoutList rethrows non-404 errors', async () => {
    mockedApiRequest.mockRejectedValue(
      new ApiRequestError(500, { data: null, messages: ['Server error'], fieldsErrors: [], resultCode: 1 }),
    );

    await expect(fetchWorkoutList('boom')).rejects.toBeInstanceOf(ApiRequestError);
  });

  it('createWorkoutList posts the dto and returns the created list', async () => {
    mockedApiRequest.mockResolvedValue(okEnvelope(LIST));
    const dto = { name: 'Push Day', description: 'chest', exercises: [] };

    const result = await createWorkoutList(dto);

    expect(mockedApiRequest).toHaveBeenCalledWith('/workout-lists', { method: 'POST', auth: true, body: dto });
    expect(result).toEqual(LIST);
  });

  it('updateWorkoutList puts to the list resource', async () => {
    mockedApiRequest.mockResolvedValue(okEnvelope(LIST));
    const dto = { name: 'x', description: '', exercises: [] };

    await updateWorkoutList('list-1', dto);

    expect(mockedApiRequest).toHaveBeenCalledWith('/workout-lists/list-1', { method: 'PUT', auth: true, body: dto });
  });

  it('deleteWorkoutList sends DELETE', async () => {
    mockedApiRequest.mockResolvedValue(okEnvelope({ result: true }));

    await deleteWorkoutList('list-1');

    expect(mockedApiRequest).toHaveBeenCalledWith('/workout-lists/list-1', { method: 'DELETE', auth: true });
  });

  it('throws when the envelope resultCode is not OK', async () => {
    mockedApiRequest.mockResolvedValue({ data: null, messages: ['boom'], fieldsErrors: [], resultCode: 1 });

    await expect(fetchWorkoutLists()).rejects.toThrow('boom');
  });
});
