/**
 * The required versions of the legal documents from `TERMS_VERSION` / `PRIVACY_VERSION`, read at call time. Bump one
 * when its document changes materially: a lower accepted version is pending (session/pending-derived).
 */
export const DocumentVersions = {
  terms(): number {
    return Number(process.env.TERMS_VERSION) || 1;
  },
  privacy(): number {
    return Number(process.env.PRIVACY_VERSION) || 1;
  },
};
