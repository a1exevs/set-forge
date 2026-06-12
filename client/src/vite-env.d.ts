/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_API_PROXY?: string;
}

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
