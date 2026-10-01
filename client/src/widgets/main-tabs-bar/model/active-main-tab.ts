import { MAIN_TAB_ROUTES } from '../config/main-tab-routes';

/** Id of the main tab whose route is the current path; empty when the path is not a main tab. */
export const getActiveMainTabId = (pathname: string): string =>
  MAIN_TAB_ROUTES.find(tab => tab.to === pathname)?.id ?? '';
