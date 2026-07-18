/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_API_PROXY?: string;
  readonly VITE_PUBLIC_ORIGIN?: string;
  readonly VITE_PRIVACY_OPERATOR_NAME?: string;
  readonly VITE_PRIVACY_CONTACT_EMAIL?: string;
}

// Injected by Vite `define` at build time (see vite.config.ts). Undefined under Jest,
// where the privacy page falls back to placeholder operator details.
declare const __PRIVACY_OPERATOR_NAME__: string;
declare const __PRIVACY_CONTACT_EMAIL__: string;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.module.scss' {
  const content: Record<string, string>;
  export default content;
}
