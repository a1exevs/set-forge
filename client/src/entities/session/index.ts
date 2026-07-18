export type { CurrentUser } from 'src/entities/session/api/session-api';
export {
  deleteLogout,
  fetchCurrentUser,
  getCaptchaUrl,
  isNeedCaptchaEnvelope,
  postLogin,
  postRegistration,
  toAbsoluteFromApiOrigin,
} from 'src/entities/session/api/session-api';
export { bootstrapSessionAndPrimeCache } from 'src/entities/session/lib/bootstrap-session';
export { emailToAvatarLetter } from 'src/entities/session/model/avatar-letter';
export {
  validateLoginEmail,
  validateLoginPassword,
  validateRegisterEmail,
  validateRegisterPassword,
} from 'src/entities/session/model/auth-validation';
export { sessionQueryKeys } from 'src/entities/session/model/session-keys';
export {
  useCurrentUserQuery,
  useDeleteAccountMutation,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from 'src/entities/session/model/use-session-queries';
