export interface UpstreamConfig {
  origin: string
  token: string
  cacheTtlSec: number
}

export function readUpstreamConfig(): UpstreamConfig | null {
  const origin = process.env.ATFX_UPSTREAM_URL?.replace(/\/$/, '') ?? ''
  const token = process.env.ATFX_UPSTREAM_TOKEN?.trim() ?? ''
  if (!origin || !token) return null

  const ttlMs = Number(process.env.ATFX_CACHE_TTL_MS ?? 300_000)
  const cacheTtlSec = Math.max(1, Math.ceil(ttlMs / 1000))

  return { origin, token, cacheTtlSec }
}

export function buildUpstreamUrl(
  origin: string,
  apiPath: string,
  query: URLSearchParams,
): string {
  const qs = query.toString()
  return `${origin}${apiPath}${qs ? `?${qs}` : ''}`
}

export function pathSegmentsFromQuery(
  pathParam: string | string[] | undefined,
): string[] {
  if (!pathParam) return []
  return Array.isArray(pathParam) ? pathParam : [pathParam]
}

export function queryWithoutPath(
  query: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (key === 'path' || value == null) continue
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item)
    } else {
      params.append(key, value)
    }
  }
  return params
}