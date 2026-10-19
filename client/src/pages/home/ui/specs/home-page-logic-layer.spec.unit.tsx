import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { answerWith } from 'tests/common/answer-confirm';

import type { WorkoutList } from '@entities/workout-list';
import type { ConfirmOptions } from '@shared/lib';

import HomePageLogicLayer from '../home-page-logic-layer';

const confirmDialogMock = jest.fn();
const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();

jest.mock('@shared/lib', () => ({
  ...jest.requireActual('@shared/lib'),
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

jest.mock('@widgets/main-tabs-bar', () => ({
  useMainTabSwipe: (): { current: null } => ({ current: null }),
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

// jsdom's File has no text(); the page reads the chosen file with it
const importFile = (): File => {
  const json = JSON.stringify({ version: 1, workoutLists: [{ name: 'Leg Day' }] });
  const file = new File([json], 'lists.json', { type: 'application/json' });
  Object.defineProperty(file, 'text', { value: (): Promise<string> => Promise.resolve(json) });
  return file;
};

describe('HomePageLogicLayer', () => {
  const deleteWorkoutList = jest.fn(async (_id: string): Promise<void> => undefined);
  const clearWorkoutSessionCachesForDeletedList = jest.fn((_workoutListId: string): void => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    confirmDialogMock.mockImplementation(answerWith(true));
  });

  it('deletes the list and clears workout session caches after confirmation', async () => {
    const user = userEvent.setup();

    render(
      <HomePageLogicLayer
        workoutLists={[WORKOUT_LIST]}
        isLoading={false}
        deleteWorkoutList={deleteWorkoutList}
        clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
        exportAllWorkoutLists={jest.fn()}
        importWorkoutLists={jest.fn()}
        onEdit={jest.fn()}
        formatDate={(date: string | null): string => date ?? ''}
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
        isLoading={false}
        deleteWorkoutList={deleteWorkoutList}
        clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
        exportAllWorkoutLists={jest.fn()}
        importWorkoutLists={jest.fn()}
        onEdit={jest.fn()}
        formatDate={(date: string | null): string => date ?? ''}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Workout list actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Failed to delete workout list');
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
        isLoading={false}
        deleteWorkoutList={deleteWorkoutList}
        clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
        exportAllWorkoutLists={jest.fn()}
        importWorkoutLists={jest.fn()}
        onEdit={jest.fn()}
        formatDate={(date: string | null): string => date ?? ''}
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
        isLoading={false}
        deleteWorkoutList={deleteWorkoutList}
        clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
        exportAllWorkoutLists={exportAllWorkoutLists}
        importWorkoutLists={jest.fn()}
        onEdit={jest.fn()}
        formatDate={(date: string | null): string => date ?? ''}
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
        isLoading={false}
        deleteWorkoutList={deleteWorkoutList}
        clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
        exportAllWorkoutLists={exportAllWorkoutLists}
        importWorkoutLists={jest.fn()}
        onEdit={jest.fn()}
        formatDate={(date: string | null): string => date ?? ''}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Export workout lists' }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Failed to export workout lists');
      expect(toastSuccessMock).not.toHaveBeenCalled();
    });
  });

  it('shows the skeleton after 300 ms while the lists load, not the empty state', () => {
    jest.useFakeTimers();
    render(
      <HomePageLogicLayer
        workoutLists={[]}
        isLoading
        deleteWorkoutList={deleteWorkoutList}
        clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
        exportAllWorkoutLists={jest.fn()}
        importWorkoutLists={jest.fn()}
        onEdit={jest.fn()}
        formatDate={(date: string | null): string => date ?? ''}
      />,
    );

    expect(screen.queryByRole('status', { name: 'Loading workout lists' })).not.toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(screen.getByRole('status', { name: 'Loading workout lists' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('No workout lists yet')).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  it('exports once when Export is pressed again while the first request is in flight', async () => {
    const user = userEvent.setup();
    const exportAllWorkoutLists = jest.fn(() => new Promise<never>((): void => undefined));

    render(
      <HomePageLogicLayer
        workoutLists={[WORKOUT_LIST]}
        isLoading={false}
        deleteWorkoutList={deleteWorkoutList}
        clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
        exportAllWorkoutLists={exportAllWorkoutLists}
        importWorkoutLists={jest.fn()}
        onEdit={jest.fn()}
        formatDate={(date: string | null): string => date ?? ''}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Export workout lists' }));
    await user.click(screen.getByRole('button', { name: 'Export workout lists' }));

    expect(exportAllWorkoutLists).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Export workout lists' })).toHaveAttribute('aria-busy', 'true');
  });

  it('imports the file inside its confirmation and reports success after it closes', async () => {
    const user = userEvent.setup();
    const importWorkoutLists = jest.fn().mockResolvedValue(undefined);
    const file = importFile();

    const { container } = render(
      <HomePageLogicLayer
        workoutLists={[WORKOUT_LIST]}
        isLoading={false}
        deleteWorkoutList={deleteWorkoutList}
        clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
        exportAllWorkoutLists={jest.fn()}
        importWorkoutLists={importWorkoutLists}
        onEdit={jest.fn()}
        formatDate={(date: string | null): string => date ?? ''}
      />,
    );

    const input = container.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('file input not found');
    }
    await user.upload(input, file);

    await waitFor((): void => {
      expect(importWorkoutLists).toHaveBeenCalledTimes(1);
      expect(toastSuccessMock).toHaveBeenCalledWith('Workout lists imported');
    });
    const [options] = confirmDialogMock.mock.calls[0] as [ConfirmOptions];
    expect(options.onConfirm).toBeDefined();
  });

  it('keeps the import confirmation open with an error toast when the import fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Import failed');
    const importWorkoutLists = jest.fn().mockRejectedValue(error);
    const file = importFile();

    const { container } = render(
      <HomePageLogicLayer
        workoutLists={[WORKOUT_LIST]}
        isLoading={false}
        deleteWorkoutList={deleteWorkoutList}
        clearWorkoutSessionCachesForDeletedList={clearWorkoutSessionCachesForDeletedList}
        exportAllWorkoutLists={jest.fn()}
        importWorkoutLists={importWorkoutLists}
        onEdit={jest.fn()}
        formatDate={(date: string | null): string => date ?? ''}
      />,
    );

    const input = container.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('file input not found');
    }
    await user.upload(input, file);

    await waitFor((): void => expect(toastErrorMock).toHaveBeenCalledWith('Failed to import workout lists'));
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });
});
