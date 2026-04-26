import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { StoryObj } from '@storybook/react';

import {
  STORY_BOOK_DESKTOP_4K_VIEWPORT_ID,
  STORY_BOOK_DESKTOP_VIEWPORT_ID,
  STORY_BOOK_MOBILE_VIEWPORT_ID,
  STORY_BOOK_TABLET_VIEWPORT_ID,
  STORY_BOOK_VIEW_PORTS,
} from 'storybook-dir/consts';

export function buildStoryObj<T>({
  args,
  defaultViewport,
  parameters = {},
  render = undefined,
}: {
  args?: StoryObj<T>['args'];
  defaultViewport: string;
  parameters: Partial<StoryObj<T>['parameters']>;
  render: StoryObj<T>['render'];
}): StoryObj<T> {
  return {
    args,
    parameters: {
      layout: 'fullscreen',
      ...parameters,
      viewport: {
        viewports: {
          ...STORY_BOOK_VIEW_PORTS,
          ...INITIAL_VIEWPORTS,
          ...MINIMAL_VIEWPORTS,
        },
        defaultViewport,
      },
    },
    render,
  } as unknown as StoryObj<T>;
}

export function buildDesktop4KStoryObj<T>({
  args,
  parameters = {},
  render,
}: {
  args?: StoryObj<T>['args'];
  parameters?: Partial<StoryObj<T>['parameters']>;
  render?: StoryObj<T>['render'];
} = {}): StoryObj<T> {
  return buildStoryObj({ args, defaultViewport: STORY_BOOK_DESKTOP_4K_VIEWPORT_ID, parameters, render });
}

export function buildDesktopStoryObj<T>({
  args,
  parameters = {},
  render,
}: {
  args?: StoryObj<T>['args'];
  parameters?: Partial<StoryObj<T>['parameters']>;
  render?: StoryObj<T>['render'];
} = {}): StoryObj<T> {
  return buildStoryObj({ args, defaultViewport: STORY_BOOK_DESKTOP_VIEWPORT_ID, parameters, render });
}

export function buildTabletStoryObj<T>({
  args,
  parameters = {},
  render,
}: {
  args?: StoryObj<T>['args'];
  parameters?: Partial<StoryObj<T>['parameters']>;
  render?: StoryObj<T>['render'];
} = {}): StoryObj<T> {
  return buildStoryObj({ args, defaultViewport: STORY_BOOK_TABLET_VIEWPORT_ID, parameters, render });
}

export function buildMobileStoryObj<T>({
  args,
  parameters = {},
  render,
}: {
  args?: StoryObj<T>['args'];
  parameters?: Partial<StoryObj<T>['parameters']>;
  render?: StoryObj<T>['render'];
} = {}): StoryObj<T> {
  return buildStoryObj({ args, defaultViewport: STORY_BOOK_MOBILE_VIEWPORT_ID, parameters, render });
}
