import type { Meta } from '@storybook/react';
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';

import { ConfirmDialogProvider } from '@shared/ui';

import WorkoutListForm from './workout-list-form-logic-layer';

const meta = {
  title: 'Widgets/WorkoutListForm',
  component: WorkoutListForm,
} satisfies Meta<typeof WorkoutListForm>;

export default meta;

const createModeArgs = {
  mode: 'create' as const,
  onSubmit: (): void => undefined,
  onCancel: (): void => undefined,
};

const editModeInitialData = {
  id: 'list-1',
  name: 'Push Day',
  description: 'Chest, shoulders, triceps',
  exercises: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroup: 'chest' as const,
      weight: 80,
      reps: 10,
      sets: 3,
    },
    {
      id: 'ex-2',
      name: 'Overhead Press',
      muscleGroup: 'shoulders' as const,
      weight: 50,
      reps: 8,
      sets: 4,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  lastUsedAt: null,
};

const editModeArgs = {
  mode: 'edit' as const,
  initialData: editModeInitialData,
  onSubmit: (): void => undefined,
  onCancel: (): void => undefined,
};

const editModeNoDataArgs = {
  mode: 'edit' as const,
  onSubmit: (): void => undefined,
  onCancel: (): void => undefined,
};

/** The server's errors of a failed save, each under its field. */
const serverErrorArgs = {
  ...editModeArgs,
  serverFieldErrors: {
    name: 'Must be a string',
    'exercises.0.muscleGroup': 'Must be one of: chest, back, legs, shoulders, arms, core, cardio',
    'exercises.1.sets': 'Must not be less than 1',
  },
};

const renderWithProvider = (
  args: typeof createModeArgs | typeof editModeArgs | typeof editModeNoDataArgs | typeof serverErrorArgs,
): ReactElement => (
  <ConfirmDialogProvider>
    <WorkoutListForm {...args} />
  </ConfirmDialogProvider>
);

/** Edit mode no data renders NotFoundMessage with Link — needs RouterProvider */
const renderEditModeNoDataWithRouter = (): ReactElement => {
  const rootRoute = createRootRoute({
    component: (): ReactElement => renderWithProvider(editModeNoDataArgs),
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return <RouterProvider router={router} />;
};

export const CreateModeDesktop4k = buildDesktop4KStoryObj<typeof meta>({
  render: () => renderWithProvider(createModeArgs),
});

export const CreateModeDesktop = buildDesktopStoryObj<typeof meta>({
  render: () => renderWithProvider(createModeArgs),
});

export const CreateModeTablet = buildTabletStoryObj<typeof meta>({
  render: () => renderWithProvider(createModeArgs),
});

export const CreateModeMobile = buildMobileStoryObj<typeof meta>({
  render: () => renderWithProvider(createModeArgs),
});

export const EditModeDesktop4k = buildDesktop4KStoryObj<typeof meta>({
  render: () => renderWithProvider(editModeArgs),
});

export const EditModeDesktop = buildDesktopStoryObj<typeof meta>({
  render: () => renderWithProvider(editModeArgs),
});

export const EditModeTablet = buildTabletStoryObj<typeof meta>({
  render: () => renderWithProvider(editModeArgs),
});

export const EditModeMobile = buildMobileStoryObj<typeof meta>({
  render: () => renderWithProvider(editModeArgs),
});

export const EditModeNoDataDesktop4k = buildDesktop4KStoryObj<typeof meta>({
  render: renderEditModeNoDataWithRouter,
});

export const EditModeNoDataDesktop = buildDesktopStoryObj<typeof meta>({
  render: renderEditModeNoDataWithRouter,
});

export const EditModeNoDataTablet = buildTabletStoryObj<typeof meta>({
  render: renderEditModeNoDataWithRouter,
});

export const EditModeNoDataMobile = buildMobileStoryObj<typeof meta>({
  render: renderEditModeNoDataWithRouter,
});

/** A save the server rejected: its field errors under the name, the muscle group and the sets. */
export const ServerErrorsDesktop = buildDesktopStoryObj<typeof meta>({
  render: () => renderWithProvider(serverErrorArgs),
});

/** The same on a phone, where the error lines wrap under narrow fields. */
export const ServerErrorsMobile = buildMobileStoryObj<typeof meta>({
  render: () => renderWithProvider(serverErrorArgs),
});
