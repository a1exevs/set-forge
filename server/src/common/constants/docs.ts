export const Docs = {
  AUTHORIZATION_CONTROLLER: 'Authentication',

  REGISTRATION_ENDPOINT: 'Register a user',
  REGISTRATION_SUCCESSFUL_RESULT: 'User registered successfully',
  REGISTRATION_BAD_REQUEST: 'Bad request',
  EMAIL_FORMAT: 'login@domain',

  AUTHORIZATION_ENDPOINT: 'Log in',
  AUTHORIZATION_SUCCESSFUL_RESULT: 'User authenticated successfully',
  AUTHORIZATION_UNAUTHORIZED: 'Unauthorized',

  REFRESH_TOKENS_ENDPOINT: 'Refresh access tokens',
  REFRESH_TOKENS_SUCCESSFUL_RESULT: 'Tokens refreshed successfully',
  REFRESH_TOKENS_UNPROCESSABLE_ENTITY: 'Unprocessable entity',
  REFRESH_TOKENS_FORBIDDEN: 'Forbidden',

  GET_CURRENT_USER_ENDPOINT: 'Get current user',
  GET_CURRENT_USER_SUCCESSFUL_RESULT: 'Current user retrieved successfully',
  GET_CURRENT_USER_UNAUTHORIZED: 'Unauthorized',
  GET_CURRENT_USER_FORBIDDEN: 'Forbidden',

  LOGOUT_ENDPOINT: 'Log out',
  LOGOUT_SUCCESSFUL_RESULT: 'Session closed successfully',
  LOGOUT_UNPROCESSABLE_ENTITY: 'Unprocessable entity',
  LOGOUT_UNAUTHORIZED: 'Unauthorized',
  LOGOUT_FORBIDDEN: 'Forbidden',

  SECURITY_CONTROLLER: 'Security',

  GET_CAPTCHA_URL_ENDPOINT: 'Get captcha URL',

  WORKOUT_LISTS_CONTROLLER: 'Workout lists',

  GET_WORKOUT_LISTS_ENDPOINT: 'List workout lists for the current user',
  GET_WORKOUT_LISTS_SUCCESSFUL_RESULT: 'Workout lists retrieved successfully',
  GET_WORKOUT_LISTS_UNAUTHORIZED: 'Unauthorized',

  GET_WORKOUT_LIST_ENDPOINT: 'Get a workout list by id',
  GET_WORKOUT_LIST_SUCCESSFUL_RESULT: 'Workout list retrieved successfully',
  GET_WORKOUT_LIST_NOT_FOUND: 'Not found',
  GET_WORKOUT_LIST_UNAUTHORIZED: 'Unauthorized',

  CREATE_WORKOUT_LIST_ENDPOINT: 'Create a workout list',
  CREATE_WORKOUT_LIST_SUCCESSFUL_RESULT: 'Workout list created successfully',
  CREATE_WORKOUT_LIST_BAD_REQUEST: 'Bad request',
  CREATE_WORKOUT_LIST_UNAUTHORIZED: 'Unauthorized',

  UPDATE_WORKOUT_LIST_ENDPOINT: 'Update a workout list',
  UPDATE_WORKOUT_LIST_SUCCESSFUL_RESULT: 'Workout list updated successfully',
  UPDATE_WORKOUT_LIST_BAD_REQUEST: 'Bad request',
  UPDATE_WORKOUT_LIST_NOT_FOUND: 'Not found',
  UPDATE_WORKOUT_LIST_UNAUTHORIZED: 'Unauthorized',

  DELETE_WORKOUT_LIST_ENDPOINT: 'Delete a workout list',
  DELETE_WORKOUT_LIST_SUCCESSFUL_RESULT: 'Workout list deleted successfully',
  DELETE_WORKOUT_LIST_NOT_FOUND: 'Not found',
  DELETE_WORKOUT_LIST_UNAUTHORIZED: 'Unauthorized',

  EXPORT_ALL_WORKOUT_LISTS_ENDPOINT: 'Export all workout lists for the current user',
  EXPORT_ALL_WORKOUT_LISTS_SUCCESSFUL_RESULT: 'Workout lists exported successfully',
  EXPORT_ALL_WORKOUT_LISTS_UNAUTHORIZED: 'Unauthorized',

  IMPORT_WORKOUT_LISTS_ENDPOINT: 'Import workout lists from file',
  IMPORT_WORKOUT_LISTS_SUCCESSFUL_RESULT: 'Workout lists imported successfully',
  IMPORT_WORKOUT_LISTS_BAD_REQUEST: 'Bad request',
  IMPORT_WORKOUT_LISTS_UNAUTHORIZED: 'Unauthorized',

  WORKOUT_SESSIONS_CONTROLLER: 'Workout sessions',

  START_WORKOUT_SESSION_ENDPOINT: 'Start or resume the active session for a workout list',
  START_WORKOUT_SESSION_SUCCESSFUL_RESULT: 'Workout session started successfully',
  START_WORKOUT_SESSION_RESUMED_RESULT: 'Active workout session resumed successfully',
  START_WORKOUT_SESSION_BAD_REQUEST: 'Workout list has no exercises',
  START_WORKOUT_SESSION_NOT_FOUND: 'Workout list not found',
  START_WORKOUT_SESSION_UNAUTHORIZED: 'Unauthorized',

  GET_ACTIVE_WORKOUT_SESSION_ENDPOINT: 'Get the active session for a workout list (or null)',
  GET_ACTIVE_WORKOUT_SESSION_SUCCESSFUL_RESULT: 'Active workout session retrieved successfully',
  GET_ACTIVE_WORKOUT_SESSION_BAD_REQUEST: 'workoutListId is missing or not a valid UUID',
  GET_ACTIVE_WORKOUT_SESSION_UNAUTHORIZED: 'Unauthorized',

  UPDATE_WORKOUT_SESSION_PROGRESS_ENDPOINT: 'Mark a session exercise set as completed',
  UPDATE_WORKOUT_SESSION_PROGRESS_SUCCESSFUL_RESULT: 'Workout session progress updated successfully',
  UPDATE_WORKOUT_SESSION_PROGRESS_BAD_REQUEST: 'Session is not active',
  UPDATE_WORKOUT_SESSION_PROGRESS_NOT_FOUND: 'Not found',
  UPDATE_WORKOUT_SESSION_PROGRESS_UNAUTHORIZED: 'Unauthorized',

  FINISH_WORKOUT_SESSION_ENDPOINT: 'Finish a workout session early',
  FINISH_WORKOUT_SESSION_SUCCESSFUL_RESULT: 'Workout session finished successfully',
  FINISH_WORKOUT_SESSION_NOT_FOUND: 'Not found',
  FINISH_WORKOUT_SESSION_UNAUTHORIZED: 'Unauthorized',

  RESYNC_WORKOUT_SESSION_ENDPOINT: 'Resync the active session from its workout list',
  RESYNC_WORKOUT_SESSION_SUCCESSFUL_RESULT: 'Workout session resynced successfully',
  RESYNC_WORKOUT_SESSION_BAD_REQUEST: 'Session is not active, source list is unlinked, or list is missing',
  RESYNC_WORKOUT_SESSION_NOT_FOUND: 'Not found',
  RESYNC_WORKOUT_SESSION_UNAUTHORIZED: 'Unauthorized',

  DISCARD_WORKOUT_SESSION_ENDPOINT: 'Discard an active workout session without saving to history',
  DISCARD_WORKOUT_SESSION_SUCCESSFUL_RESULT: 'Workout session discarded successfully',
  DISCARD_WORKOUT_SESSION_BAD_REQUEST: 'Session is not active',
  DISCARD_WORKOUT_SESSION_NOT_FOUND: 'Not found',
  DISCARD_WORKOUT_SESSION_UNAUTHORIZED: 'Unauthorized',

  GET_WORKOUT_HISTORY_ENDPOINT: 'Get completed workout sessions (history, paginated, newest first)',
  GET_WORKOUT_HISTORY_SUCCESSFUL_RESULT: 'Workout history retrieved successfully',
  GET_WORKOUT_HISTORY_BAD_REQUEST: 'limit or offset is invalid',
  GET_WORKOUT_HISTORY_UNAUTHORIZED: 'Unauthorized',
};
