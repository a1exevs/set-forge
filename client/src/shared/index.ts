// api
export {
  apiRequest,
  ApiRequestError,
  clearAccessToken,
  getAccessToken,
  getApiBaseUrl,
  refreshAccessToken,
  ResultCodes,
  setAccessToken,
  type ApiRequestOptions,
  type CommonResponseEnvelope,
  type HttpMethod,
} from 'src/shared/api';

// model
export {
  DESKTOP_4K_SCREEN_WIDTH_PX,
  DESKTOP_SCREEN_WIDTH_PX,
  TABLET_SCREEN_WIDTH_PX,
  MOBILE_SCREEN_WIDTH_PX,
  SM_PX,
  useThemeStore,
  type Theme,
  type ThemeState,
  createSelectors,
  formatDate,
  downloadJsonFile,
  buildWorkoutListsExportFilename,
  getAdjacentTabRoute,
  useHorizontalSwipe,
  useTabSwipeNavigation,
  type SwipeDirection,
  type TabRoute,
  type UseHorizontalSwipeOptions,
  type UseTabSwipeNavigationOptions,
} from 'src/shared/model';

// ui
export {
  Button,
  ConfirmDialogProvider,
  Dialog,
  IconButton,
  BrandWordmark,
  LegalDocument,
  MenuButton,
  NumericField,
  PasswordField,
  UserAvatar,
  UserAvatarMenu,
  useConfirm,
  TabsBar,
  type LegalContent,
  type LegalLang,
  type LegalLink,
  type LegalSection,
  type LegalText,
} from 'src/shared/ui';
