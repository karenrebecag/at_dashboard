/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_ATFX_API_URL: string
  readonly VITE_ATFX_API_TOKEN: string
  readonly VITE_ATFX_QUERY_STALE_MS?: string
  readonly VITE_ATFX_DASHBOARD_POLL_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}