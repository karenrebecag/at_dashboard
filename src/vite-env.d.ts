/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  /** Default true — same-origin BFF at /api/atfx (no token in browser). */
  readonly VITE_ATFX_USE_BFF?: string
  readonly VITE_ATFX_API_BASE?: string
  /** Legacy direct VM access when VITE_ATFX_USE_BFF=false */
  readonly VITE_ATFX_API_URL?: string
  readonly VITE_ATFX_API_TOKEN?: string
  readonly VITE_ATFX_QUERY_STALE_MS?: string
  readonly VITE_ATFX_DASHBOARD_STALE_MS?: string
  readonly VITE_ATFX_DASHBOARD_POLL_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}