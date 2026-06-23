/** ATFX API env — Vite exposes only VITE_* vars to the client bundle. */

export const atfxEnv = {
  apiUrl: (import.meta.env.VITE_ATFX_API_URL ?? '').replace(/\/$/, ''),
  apiToken: import.meta.env.VITE_ATFX_API_TOKEN ?? '',
  /** Client-side TanStack Query stale time (ms). Default 60s. */
  queryStaleMs: Number(import.meta.env.VITE_ATFX_QUERY_STALE_MS ?? 60_000),
  /** Dashboard polling interval (ms). Default 30s. */
  dashboardPollMs: Number(import.meta.env.VITE_ATFX_DASHBOARD_POLL_MS ?? 30_000),
} as const

export function isAtfxConfigured(): boolean {
  return Boolean(atfxEnv.apiUrl && atfxEnv.apiToken)
}

export const ATFX_ENV_VARS = [
  'VITE_ATFX_API_URL',
  'VITE_ATFX_API_TOKEN',
] as const

export const ATFX_OPTIONAL_ENV_VARS = [
  'VITE_ATFX_QUERY_STALE_MS',
  'VITE_ATFX_DASHBOARD_POLL_MS',
] as const