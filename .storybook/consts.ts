import {
  DESKTOP_4K_SCREEN_WIDTH_PX,
  DESKTOP_SCREEN_WIDTH_PX,
  MOBILE_SCREEN_WIDTH_PX,
  TABLET_SCREEN_WIDTH_PX,
} from 'src/shared';

export const STORY_BOOK_DESKTOP_4K_VIEWPORT_ID = 'sitDesktop4k';
export const STORY_BOOK_DESKTOP_VIEWPORT_ID = 'sitDesktop';
export const STORY_BOOK_TABLET_VIEWPORT_ID = 'sitTablet';
export const STORY_BOOK_MOBILE_VIEWPORT_ID = 'sitMobile';
export const STORY_BOOK_VIEW_PORTS = {
  [STORY_BOOK_DESKTOP_4K_VIEWPORT_ID]: {
    name: `Desktop ${DESKTOP_4K_SCREEN_WIDTH_PX}`,
    styles: {
      width: `${DESKTOP_4K_SCREEN_WIDTH_PX}px`,
      height: '2160px',
    },
    type: 'desktop',
  },
  [STORY_BOOK_DESKTOP_VIEWPORT_ID]: {
    name: `Desktop ${DESKTOP_SCREEN_WIDTH_PX}`,
    styles: {
      width: `${DESKTOP_SCREEN_WIDTH_PX}px`,
      height: '1080px',
    },
    type: 'desktop',
  },
  [STORY_BOOK_TABLET_VIEWPORT_ID]: {
    name: `Tablet ${TABLET_SCREEN_WIDTH_PX}`,
    styles: {
      width: `${TABLET_SCREEN_WIDTH_PX}px`,
      height: '800px',
    },
    type: 'tablet',
  },
  [STORY_BOOK_MOBILE_VIEWPORT_ID]: {
    name: `Mobile ${MOBILE_SCREEN_WIDTH_PX}`,
    styles: {
      width: `${MOBILE_SCREEN_WIDTH_PX}px`,
      height: '800px',
    },
    type: 'mobile',
  },
};
