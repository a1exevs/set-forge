/** The codes of the server's error catalogue (`server/src/common/constants/error-messages.ts`), mirrored. */
export const SERVER_ERROR_CODES = [
  'MUST_BE_A_NUMBER',
  'MUST_BE_AN_INTEGER_NUMBER',
  'MUST_BE_A_STRING',
  'MUST_BE_AN_ARRAY',
  'MUST_BE_A_UUID',
  'MUST_BE_ONE_OF',
  'MUST_HAS_EMAIL_FORMAT',
  'CONSENT_TO_PERSONAL_DATA_PROCESSING_IS_REQUIRED',
  'TERMS_ACCEPTANCE_IS_REQUIRED',
  'STRING_LENGTH_MUST_NOT_BE_LESS_THAN_M_AND_GREATER_THAN_N',
  'NUMERIC_MUST_NOT_BE_LESS_THAN_N',
  'NUMERIC_MUST_NOT_BE_GREATER_THAN_N',
  'ARRAY_MUST_NOT_BE_SHORTER_THAN_N',
  'UNAUTHORIZED',
  'NEED_AUTHORIZATION_WITH_CAPTCHA',
  'FORBIDDEN',
  'NOT_ENOUGH_PERMISSIONS',
  'INVALID_EMAIL_OR_PASSWORD',
  'USER_ROLE_CONFIGURATION_IS_MISSING',
  'REFRESH_TOKEN_IS_MALFORMED',
  'REFRESH_TOKEN_EXPIRED',
  'REFRESH_TOKEN_NOT_FOUND',
  'REFRESH_TOKEN_REVOKED',
  'USER_ALREADY_EXISTS',
  'FAILED_TO_CREATE_USER',
  'FAILED_TO_CREATE_ROLE',
  'INVALID_IMPORT_FILE_FORMAT',
  'UNSUPPORTED_EXPORT_FILE_VERSION',
  'BAD_REQUEST',
  'NOT_FOUND',
  'UNPROCESSABLE_ENTITY',
  'PAYLOAD_TOO_LARGE',
  'INTERNAL_ERROR',
] as const;

/** Failures that never reach a server answer in the envelope: no connection, or a body that is not the envelope. */
const CLIENT_ERROR_CODES = ['NETWORK_ERROR', 'UNEXPECTED_RESPONSE'] as const;

export type ErrorCode = (typeof SERVER_ERROR_CODES)[number] | (typeof CLIENT_ERROR_CODES)[number];

export type ErrorParams = Record<string, string | number>;

/** One error of the envelope; `code` stays a string — a server newer than the client may send an unknown one. */
export type ApiErrorItem = {
  code: string;
  params: ErrorParams;
  field?: string;
  message: string;
};

const KNOWN_CODES: ReadonlySet<string> = new Set<string>([...SERVER_ERROR_CODES, ...CLIENT_ERROR_CODES]);

export const isErrorCode = (code: string): code is ErrorCode => KNOWN_CODES.has(code);
