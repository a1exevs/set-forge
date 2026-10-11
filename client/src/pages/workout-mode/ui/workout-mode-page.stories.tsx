import type { Meta } from '@storybook/react';
import { fn } from '@storybook/test';

import { mockWorkoutList } from 'storybook-dir/fixtures/workout-lists';
import { mockActiveWorkoutSession } from 'storybook-dir/fixtures/workout-sessions';
import {
  buildDesktop4KStoryObj,
  buildDesktopStoryObj,
  buildMobileStoryObj,
  buildTabletStoryObj,
} from 'storybook-dir/helpers';
import { renderWithPageRouter } from 'storybook-dir/render-with-page-router';

import type { WorkoutSession } from '@entities/workout-session';

import WorkoutModePageLogicLayer from './workout-mode-page-logic-layer';

const renderWorkoutModePage = (session: WorkoutSession | null) => (): ReturnType<typeof renderWithPageRouter> =>
  renderWithPageRouter({
    initialEntries: ['/'],
    component: (): JSX.Element => (
      <WorkoutModePageLogicLayer
        workoutList={mockWorkoutList}
        session={session}
        isStarting={false}
        startSession={fn()}
        incrementProgress={fn(async (): Promise<WorkoutSession> => mockActiveWorkoutSession)}
        finishSession={fn()}
        discardSession={fn()}
      />
    ),
  });

const renderPreview = renderWorkoutModePage(null);
const renderTraining = renderWorkoutModePage(mockActiveWorkoutSession);

const meta = {
  title: 'Pages/WorkoutModePage',
  component: WorkoutModePageLogicLayer,
} satisfies Meta<typeof WorkoutModePageLogicLayer>;

export default meta;

/** Preview, no session yet: the exercise list and the start button, at 4K. */
export const PreviewDesktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderPreview });
/** Preview on a desktop screen. */
export const PreviewDesktop = buildDesktopStoryObj<typeof meta>({ render: renderPreview });
/** Preview on a tablet. */
export const PreviewTablet = buildTabletStoryObj<typeof meta>({ render: renderPreview });
/** Preview on a phone: the everyday form of the page. */
export const PreviewMobile = buildMobileStoryObj<typeof meta>({ render: renderPreview });

/** Training, mid-session: the first exercise done, the second half-way, at 4K. */
export const TrainingDesktop4k = buildDesktop4KStoryObj<typeof meta>({ render: renderTraining });
/** Training on a desktop screen. */
export const TrainingDesktop = buildDesktopStoryObj<typeof meta>({ render: renderTraining });
/** Training on a tablet. */
export const TrainingTablet = buildTabletStoryObj<typeof meta>({ render: renderTraining });
/** Training on a phone: progress and the set counter under the thumb. */
export const TrainingMobile = buildMobileStoryObj<typeof meta>({ render: renderTraining });

const renderLoading = (): ReturnType<typeof renderWithPageRouter> =>
  renderWithPageRouter({
    initialEntries: ['/'],
    component: (): JSX.Element => (
      <WorkoutModePageLogicLayer
        workoutList={undefined}
        session={null}
        isStarting={false}
        startSession={fn()}
        incrementProgress={fn(async (): Promise<WorkoutSession> => mockActiveWorkoutSession)}
        finishSession={fn()}
        discardSession={fn()}
      />
    ),
  });

/** The list and the session are still loading: the way back is real, the rest is a skeleton. */
export const LoadingMobile = buildMobileStoryObj<typeof meta>({ render: renderLoading });
