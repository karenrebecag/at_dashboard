import axios, { type AxiosInstance } from 'axios'
import { atfxApiBaseUrl, atfxEnv, isAtfxConfigured } from './env'
import type {
  AggregateParams,
  AtfxApiEnvelope,
  AtfxApiIndex,
  AtfxOrg,
  ConversionRate,
  DescribeResult,
  SearchParams,
  SfQueryResult,
  SoqlQueryParams,
} from './types'

export { isAtfxConfigured } from './env'

let bypassCache = false

/** Skip BFF edge cache for the next in-flight requests (manual Refresh). */
export function runWithBypassCache<T>(fn: () => Promise<T>): Promise<T> {
  bypassCache = true
  return fn().finally(() => {
    bypassCache = false
  })
}

function createClient(): AxiosInstance {
  if (!isAtfxConfigured()) {
    throw new Error(
      'ATFX API not configured — set VITE_ATFX_USE_BFF=true (default) or legacy VITE_ATFX_API_URL + VITE_ATFX_API_TOKEN',
    )
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (!atfxEnv.useBff && atfxEnv.apiToken) {
    headers.Authorization = `Bearer ${atfxEnv.apiToken}`
  }

  const instance = axios.create({
    baseURL: atfxApiBaseUrl(),
    headers,
    timeout: 90_000,
  })

  instance.interceptors.request.use((config) => {
    if (bypassCache) {
      config.headers.set('X-ATFX-Bypass-Cache', '1')
    }
    return config
  })

  return instance
}

let client: AxiosInstance | null = null

export function atfxClient(): AxiosInstance {
  if (!client) client = createClient()
  return client
}

// --- Request flow control -------------------------------------------------
// Bounded concurrency (queue + chunking) so a full dashboard load doesn't fire
// ~13 slow Salesforce queries at once, plus in-flight dedup (idempotency): the
// API is read-only, so identical concurrent requests share a single response.
const MAX_CONCURRENT = 4

function createLimiter(max: number) {
  let active = 0
  const queue: Array<() => void> = []
  const drain = () => {
    while (active < max && queue.length > 0) {
      active++
      queue.shift()?.()
    }
  }
  return function limit<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        task()
          .then(resolve, reject)
          .finally(() => {
            active--
            drain()
          })
      })
      drain()
    })
  }
}

const limit = createLimiter(MAX_CONCURRENT)
const inFlight = new Map<string, Promise<unknown>>()

function stableKey(value: unknown): string {
  if (value == null || typeof value !== 'object') {
    return JSON.stringify(value ?? null)
  }
  if (Array.isArray(value)) return `[${value.map(stableKey).join(',')}]`
  const obj = value as Record<string, unknown>
  return `{${Object.keys(obj)
    .sort()
    .map((k) => `${k}:${stableKey(obj[k])}`)
    .join(',')}}`
}

function enqueue<T>(key: string, task: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key)
  if (existing) return existing as Promise<T>
  const p = limit(task).finally(() => inFlight.delete(key))
  inFlight.set(key, p)
  return p
}

async function get<T>(path: string, params?: object) {
  // Capture bypass per-call — the global flag may flip before a queued task runs
  const bypass = bypassCache
  const key = `GET ${path} ${stableKey(params)} ${bypass ? 'B' : ''}`
  return enqueue(key, async () => {
    const { data } = await atfxClient().get<AtfxApiEnvelope<T>>(path, {
      params,
      headers: bypass ? { 'X-ATFX-Bypass-Cache': '1' } : undefined,
    })
    return data
  })
}

async function post<T>(path: string, body?: unknown) {
  const bypass = bypassCache
  const key = `POST ${path} ${stableKey(body)} ${bypass ? 'B' : ''}`
  return enqueue(key, async () => {
    const { data } = await atfxClient().post<AtfxApiEnvelope<T>>(path, body, {
      headers: bypass ? { 'X-ATFX-Bypass-Cache': '1' } : undefined,
    })
    return data
  })
}

export const atfxApi = {
  index: () => get<AtfxApiIndex>('/'),
  org: () => get<AtfxOrg>('/org'),
  schema: () => get<{ format: string; content: string }>('/schema'),
  schemaSection: (section: string) =>
    get<{ format: string; uri: string; content: string }>(`/schema/${section}`),
  describe: (sobject: string, params?: { mode?: string; search?: string; field?: string }) =>
    get<DescribeResult>(`/describe/${sobject}`, params),
  picklists: (object: string) => get<DescribeResult>(`/picklists/${object}`),
  aggregate: (body: AggregateParams) => post<SfQueryResult>('/aggregate', body),
  search: (params: SearchParams) => get<SfQueryResult>('/search', params),
  record: (object: string, id: string, fields?: string) =>
    get<SfQueryResult>(`/records/${object}/${id}`, fields ? { fields } : undefined),
  query: (body: SoqlQueryParams) => post<SfQueryResult>('/query', body),
  leadsByBdm: (period = 'THIS_MONTH') =>
    get<SfQueryResult>('/dashboard/leads/by-bdm', { period }),
  leadsByCountry: (days = 30) =>
    get<SfQueryResult>('/dashboard/leads/by-country', { days }),
  conversionRate: (days = 30) =>
    get<ConversionRate>('/dashboard/leads/conversion-rate', { days }),
}