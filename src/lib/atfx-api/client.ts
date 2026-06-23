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

async function get<T>(path: string, params?: object) {
  const { data } = await atfxClient().get<AtfxApiEnvelope<T>>(path, { params })
  return data
}

async function post<T>(path: string, body?: unknown) {
  const { data } = await atfxClient().post<AtfxApiEnvelope<T>>(path, body)
  return data
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