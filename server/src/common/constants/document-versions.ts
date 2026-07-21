/**
 * Current required versions of the legal documents, read from the environment
 * (`TERMS_VERSION` / `PRIVACY_VERSION`, default `1`). Bump the env value when a document
 * changes materially — users whose stored accepted version is lower (or null) are asked to
 * re-accept on their next visit. Read at call time so runtime env changes are picked up.
 */
export const DocumentVersions = {
  terms(): number {
    return Number(process.env.TERMS_VERSION) || 1;
  },
  privacy(): number {
    return Number(process.env.PRIVACY_VERSION) || 1;
  },
};
