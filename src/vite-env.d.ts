/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_ATFX_API_URL: string
  readonly VITE_ATFX_API_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}