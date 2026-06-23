/** ATFX API env — Vite exposes only VITE_* vars to the client bundle. */

function normalizeBase(value: string): string {
  return value.replace(/\/$/, '')
}

const useBff = import.meta.env.VITE_ATFX_USE_BFF !== 'false'

export const atfxEnv = {
  /** When true (default), browser calls same-origin `/api/atfx` BFF — token stays server-side. */
  useBff,
  apiBase: normalizeBase(import.meta.env.VITE_ATFX_API_BASE ?? '/api/atfx'),
  /** Legacy direct mode — only when VITE_ATFX_USE_BFF=false */
  apiUrl: normalizeBase(import.meta.env.VITE_ATFX_API_URL ?? ''),
  apiToken: import.meta.env.VITE_ATFX_API_TOKEN ?? '',
  /** Client-side TanStack Query stale time (ms). Default 60s. */
  queryStaleMs: Number(import.meta.env.VITE_ATFX_QUERY_STALE_MS ?? 60_000),
  /** Dashboard query stale time (ms). Default 5 min — no auto-poll. */
  dashboardStaleMs: Number(
    import.meta.env.VITE_ATFX_DASHBOARD_STALE_MS ?? 300_000,
  ),
} as const

export function atfxApiBaseUrl(): string {
  if (atfxEnv.useBff) return atfxEnv.apiBase
  return `${atfxEnv.apiUrl}/api`
}

export function isAtfxConfigured(): boolean {
  if (atfxEnv.useBff) return true
  return Boolean(atfxEnv.apiUrl && atfxEnv.apiToken)
}

export const ATFX_ENV_VARS = ['VITE_ATFX_USE_BFF', 'VITE_ATFX_API_BASE'] as const

export const ATFX_LEGACY_ENV_VARS = [
  'VITE_ATFX_API_URL',
  'VITE_ATFX_API_TOKEN',
] as const

export const ATFX_OPTIONAL_ENV_VARS = [
  'VITE_ATFX_QUERY_STALE_MS',
  'VITE_ATFX_DASHBOARD_STALE_MS',
  'VITE_ATFX_DASHBOARD_POLL_MS',
] as const