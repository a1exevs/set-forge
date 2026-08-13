import type { WorkoutList } from '@entities';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import HomePageLogicLayer from 'src/pages/home/ui/home-page-logic-layer';

const confirmDialogMock = jest.fn();
const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();

jest.mock('@shared', () => ({
  ...jest.requireActual('@shared'),
  useConfirm: () => confirmDialogMock,
  toastSuccess: (...args: unknown[]): void => toastSuccessMock(...args),
  toastError: (...args: unknown[]): void => toastErrorMock(...args),
  downloadJsonFile: jest.fn(),
}));

jest.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  useRouterState: ({ select }: { select: (state: { location: { pathname: string } }) => string }): string =>
    select({ location: { pathname: '/' } }),
  useNavigate: () => jest.fn(),
}));

jest.mock('@widgets', () => ({
  MAIN_TAB_ROUTES: [],
  MainTabsBar: () => null,
}));

const WORKOUT_LIST: WorkoutList = {
  id: 'list-1',
  name: 'Push Day',
  description: 'Chest workout',
  exercises: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroup: 'chest',
      weight: 60,
      reps: 10,
      sets: 3,
    },
  ],
  createdAt: '2026-06-01T00:00:00.000Z',
  lastUsedAt: null,
};

describe('HomePageLogicLayer', () => {
  const deleteWorkoutList = jest.fn(async (_id: string): Promise<void> => undefined);
  const clearWorkoutSessionCachesForDeletedList = jest.fn((_workoutListId: string): void => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    confirmDialogMock.mockResolvedValue(true);
  });

  it('deletes the list and clears workout session caches after confirmation', async () => {
    const user = userEvent.setup();

    render(
      <HomePageLogicLayer
        workoutLists={[WORKOUT_LIST]}
        deleteWorkoutList={deleteWorkoutList}
        clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
        exportAllWorkoutLists={jest.fn()}
        importWorkoutLists={jest.fn()}
        onEdit={jest.fn()}
        formatDate={(date): string => date ?? ''}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Workout list actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    await waitFor(() => {
      expect(deleteWorkoutList).toHaveBeenCalledWith('list-1');
      expect(clearWorkoutSessionCachesForDeletedList).toHaveBeenCalledWith('list-1');
      expect(toastSuccessMock).toHaveBeenCalledWith('Workout list deleted');
      expect(toastErrorMock).not.toHaveBeenCalled();
    });
  });

  it('shows error toast when delete fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Delete failed');
    deleteWorkoutList.mockRejectedValueOnce(error);

    render(
      <HomePageLogicLayer
        workoutLists={[WORKOUT_LIST]}
        deleteWorkoutList={deleteWorkoutList}
        clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
        exportAllWorkoutLists={jest.fn()}
        importWorkoutLists={jest.fn()}
        onEdit={jest.fn()}
        formatDate={(date): string => date ?? ''}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Workout list actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(error, 'Failed to delete workout list');
      expect(toastSuccessMock).not.toHaveBeenCalled();
      expect(clearWorkoutSessionCachesForDeletedList).not.toHaveBeenCalled();
    });
  });

  it('does not delete or clear caches when confirmation is cancelled', async () => {
    confirmDialogMock.mockResolvedValue(false);
    const user = userEvent.setup();

    render(
      <HomePageLogicLayer
        workoutLists={[WORKOUT_LIST]}
        deleteWorkoutList={deleteWorkoutList}
        clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
        exportAllWorkoutLists={jest.fn()}
        importWorkoutLists={jest.fn()}
        onEdit={jest.fn()}
        formatDate={(date): string => date ?? ''}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Workout list actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    await waitFor(() => {
      expect(confirmDialogMock).toHaveBeenCalled();
    });

    expect(deleteWorkoutList).not.toHaveBeenCalled();
    expect(clearWorkoutSessionCachesForDeletedList).not.toHaveBeenCalled();
  });

  it('exports lists and shows success toast', async () => {
    const user = userEvent.setup();
    const exportData = { version: 1 as const, exportedAt: '2026-01-01', workoutLists: [] };
    const exportAllWorkoutLists = jest.fn().mockResolvedValue(exportData);

    render(
      <HomePageLogicLayer
        workoutLists={[WORKOUT_LIST]}
        deleteWorkoutList={deleteWorkoutList}
        clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
        exportAllWorkoutLists={exportAllWorkoutLists}
        importWorkoutLists={jest.fn()}
        onEdit={jest.fn()}
        formatDate={(date): string => date ?? ''}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Export workout lists' }));

    await waitFor(() => {
      expect(exportAllWorkoutLists).toHaveBeenCalled();
      expect(toastSuccessMock).toHaveBeenCalledWith('Workout lists exported');
      expect(toastErrorMock).not.toHaveBeenCalled();
    });
  });

  it('shows error toast when export fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Export failed');
    const exportAllWorkoutLists = jest.fn().mockRejectedValue(error);

    render(
      <HomePageLogicLayer
        workoutLists={[WORKOUT_LIST]}
        deleteWorkoutList={deleteWorkoutList}
        clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
        exportAllWorkoutLists={exportAllWorkoutLists}
        importWorkoutLists={jest.fn()}
        onEdit={jest.fn()}
        formatDate={(date): string => date ?? ''}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Export workout lists' }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(error, 'Failed to export workout lists');
      expect(toastSuccessMock).not.toHaveBeenCalled();
    });
  });
});
