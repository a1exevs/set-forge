/**
 * The error catalogue: the key is the code the API sends in `fieldsErrors[].code`, the value is its English text with
 * named `{param}` placeholders filled from `fieldsErrors[].params`. The client translates by the code.
 */
export const ErrorMessages = {
  // Validation
  MUST_BE_A_NUMBER: 'Must be a number',
  MUST_BE_AN_INTEGER_NUMBER: 'Must be an integer',
  MUST_BE_A_STRING: 'Must be a string',
  MUST_BE_AN_ARRAY: 'Must be an array',
  MUST_BE_A_UUID: 'Must be a UUID',
  MUST_BE_ONE_OF: 'Must be one of: {values}',
  MUST_HAS_EMAIL_FORMAT: 'Invalid email format',
  CONSENT_TO_PERSONAL_DATA_PROCESSING_IS_REQUIRED: 'Consent to the processing of personal data is required',
  TERMS_ACCEPTANCE_IS_REQUIRED: 'Acceptance of the Terms of Use is required',
  STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N:
    'Length must be greater than {min} and less than {max} characters',
  NUMERIC_MUST_NOT_BE_LESS_THAN_N: 'Must not be less than {min}',
  NUMERIC_MUST_NOT_BE_GREATER_THAN_N: 'Must not be greater than {max}',
  ARRAY_MUST_NOT_BE_SHORTER_THAN_N: 'Must contain at least {min} items',

  // Access
  UNAUTHORIZED: 'User is not authorized',
  NEED_AUTHORIZATION_WITH_CAPTCHA: 'Captcha verification required',
  FORBIDDEN: 'Access denied',
  NOT_ENOUGH_PERMISSIONS: 'Insufficient permissions',
  INVALID_EMAIL_OR_PASSWORD: 'Invalid email or password',
  USER_ROLE_CONFIGURATION_IS_MISSING: 'Service is unavailable: user role configuration is missing',

  // Refresh tokens
  REFRESH_TOKEN_IS_MALFORMED: 'Refresh token is malformed',
  REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',
  REFRESH_TOKEN_NOT_FOUND: 'Refresh token not found',
  REFRESH_TOKEN_REVOKED: 'Refresh token revoked',

  // Users and roles
  USER_ALREADY_EXISTS: 'User already exists',
  FAILED_TO_CREATE_USER: 'Failed to create user',
  FAILED_TO_CREATE_ROLE: 'Failed to create role',

  // Workout lists
  INVALID_IMPORT_FILE_FORMAT: 'Invalid import file format',
  UNSUPPORTED_EXPORT_FILE_VERSION: 'Unsupported export file version',

  // By HTTP status — errors without a code of their own (bare Nest exceptions, routing, body parsing, crashes)
  BAD_REQUEST: 'Bad request',
  NOT_FOUND: 'Not found',
  UNPROCESSABLE_ENTITY: 'Unprocessable entity',
  PAYLOAD_TOO_LARGE: 'Request is too large',
  INTERNAL_ERROR: 'Internal server error',
} as const;

export type ErrorCode = keyof typeof ErrorMessages;

export type ErrorParams = Record<string, string | number>;
