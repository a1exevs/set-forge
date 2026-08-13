import type { CreateWorkoutListDto } from '@entities';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateWorkoutPageDataLayer from 'src/pages/create-workout/ui/create-workout-page-data-layer';

const mutateAsyncMock = jest.fn();

jest.mock('@entities', () => ({
  useCreateWorkoutListMutation: (): { mutateAsync: typeof mutateAsyncMock } => ({
    mutateAsync: mutateAsyncMock,
  }),
}));

jest.mock('src/pages/create-workout/ui/create-workout-page-logic-layer', () => ({
  __esModule: true,
  default: ({ onCreate }: { onCreate: (dto: CreateWorkoutListDto) => Promise<void> }) => (
    <button
      type="button"
      onClick={(): void => {
        void onCreate({
          name: 'Push Day',
          description: 'Chest',
          exercises: [],
        });
      }}
    >
      Trigger create
    </button>
  ),
}));

describe('CreateWorkoutPageDataLayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mutateAsyncMock.mockResolvedValue(undefined);
  });

  it('passes onCreate that calls createWorkoutListMutation.mutateAsync', async () => {
    const user = userEvent.setup();

    render(<CreateWorkoutPageDataLayer />);

    await user.click(screen.getByRole('button', { name: 'Trigger create' }));

    await waitFor((): void => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        name: 'Push Day',
        description: 'Chest',
        exercises: [],
      });
    });
  });
});
