export const ErrorMessages = {
  // Validation
  MUST_BE_A_NUMBER: 'Must be a number',
  MUST_BE_AN_INTEGER_NUMBER: 'Must be an integer',
  MUST_BE_A_STRING: 'Must be a string',
  MUST_BE_A_BOOLEAN: 'Must be a boolean',
  MUST_HAS_EMAIL_FORMAT: 'Invalid email format',
  STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N:
    'Length must be greater than {0} and less than {1} characters',
  STRING_LENGTH_MUST_NOT_BE_GREATER_THAN_N: 'Length must be less than {0} characters',
  NUMERIC_MUST_NOT_BE_LESS_THAN_N: 'Must not be less than {0}',
  NUMERIC_MUST_NOT_BE_GREATER_THAN_N: 'Must not be greater than {0}',

  // Access
  UNAUTHORIZED: 'User is not authorized',
  NEED_AUTHORIZATION_WITH_CAPTCHA: 'Captcha verification required',
  FORBIDDEN: 'Access denied',
  NOT_ENOUGH_PERMISSIONS: 'Insufficient permissions',
  INVALID_EMAIL_OR_PASSWORD: 'Invalid email or password',
  SERVICE_IS_UNAVAILABLE: 'Service is unavailable',
  USER_ROLE_CONFIGURATION_IS_MISSING: 'User role configuration is missing',

  // Refresh tokens
  REFRESH_TOKEN_IS_MALFORMED: 'Refresh token is malformed',
  REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',
  REFRESH_TOKEN_NOT_FOUND: 'Refresh token not found',
  REFRESH_TOKEN_REVOKED: 'Refresh token revoked',

  // Files
  FILE_UPLOAD_ERROR: 'An error occurred while saving the file',
  UPLOAD_FILE_SIZE_CANNOT_EXCEED_N_MBT: 'Uploaded file size must not exceed {0} MB',
  FILE_NOT_SELECTED: 'No file selected',
  IMAGE_FILE_COMPRESSING_ERROR: 'Error compressing image file',

  // Users
  USER_M_IS_ALREADY_A_FOLLOWER_OF_USER_N: 'User id={0} is already a follower of user id={1}',
  USER_M_IS_NOT_A_FOLLOWER_OF_USER_N: 'User id={0} is not a follower of user id={1}',
  USER_ALREADY_HAS_THE_ROLE_N: 'User already has role {0}',
  USER_ALREADY_EXISTS: 'User already exists',
  USER_N_NOT_FOUND: 'User with id {0} not found',

  // Failures
  FAILED_TO_CREATE_POST: 'Failed to create post',
  FAILED_TO_CREATE_ROLE: 'Failed to create role',
  FAILED_TO_FIND_USER: 'Failed to find user',
  FAILED_TO_FIND_ROLE: 'Failed to find role',
  FAILED_TO_CREATE_USER: 'Failed to create user',
};
