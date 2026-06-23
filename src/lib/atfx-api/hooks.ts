import { useEffect, useState } from 'react'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import { atfxApi, runWithBypassCache } from './client'
import { atfxEnv } from './env'
import { atfxKeys } from './keys'
import type { AggregateParams, SearchParams, SoqlQueryParams } from './types'

const STALE_MS = atfxEnv.queryStaleMs
/** Dashboard widgets — long stale; no auto-poll (use Refresh) */
const DASHBOARD_STALE_MS = atfxEnv.dashboardStaleMs

const dashboardQueryDefaults = {
  placeholderData: keepPreviousData,
  retry: (failureCount: number, error: unknown) => {
    if (failureCount >= 2) return false
    const status = (error as { response?: { status?: number } })?.response?.status
    return status === 502 || status === 503 || status === 504
  },
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000),
} as const

/**
 * Gate bulk dashboard fetches until org metadata returns (or a short timeout).
 * Avoids ~10 parallel sf CLI calls on cold cache that stampede the VM.
 */
export function useDashboardBatchReady(timeoutMs = 1_000) {
  const org = useAtfxOrg()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), timeoutMs)
    return () => clearTimeout(id)
  }, [timeoutMs])

  return org.isFetched || timedOut
}

export function useAtfxOrg() {
  return useQuery({
    queryKey: atfxKeys.org(),
    queryFn: () => atfxApi.org(),
    staleTime: STALE_MS * 10,
    ...dashboardQueryDefaults,
  })
}

export function useAtfxIndex() {
  return useQuery({
    queryKey: atfxKeys.index(),
    queryFn: () => atfxApi.index(),
    staleTime: STALE_MS * 10,
  })
}

export function useAtfxSchema() {
  return useQuery({
    queryKey: atfxKeys.schema(),
    queryFn: () => atfxApi.schema(),
    staleTime: STALE_MS * 10,
  })
}

export function useAtfxSchemaSection(section: string) {
  return useQuery({
    queryKey: atfxKeys.schemaSection(section),
    queryFn: () => atfxApi.schemaSection(section),
    staleTime: STALE_MS * 10,
    enabled: Boolean(section),
  })
}

export function useAtfxDescribe(
  sobject: string,
  params?: { mode?: string; search?: string; field?: string },
) {
  return useQuery({
    queryKey: atfxKeys.describe(sobject, params),
    queryFn: () => atfxApi.describe(sobject, params),
    staleTime: STALE_MS,
    enabled: Boolean(sobject),
  })
}

export function useAtfxPicklists(object: string, enabled = true) {
  return useQuery({
    queryKey: atfxKeys.picklists(object),
    queryFn: () => atfxApi.picklists(object),
    staleTime: STALE_MS * 10,
    enabled: enabled && Boolean(object),
    ...dashboardQueryDefaults,
  })
}

export function useAtfxAggregate(params: AggregateParams, enabled = true) {
  return useQuery({
    queryKey: atfxKeys.aggregate(params),
    queryFn: () => atfxApi.aggregate(params),
    staleTime: DASHBOARD_STALE_MS,
    enabled:
      enabled && Boolean(params.object) && params.groupBy.length > 0,
    ...dashboardQueryDefaults,
  })
}

export function useAtfxSearch(params: SearchParams, enabled = true) {
  return useQuery({
    queryKey: atfxKeys.search(params),
    queryFn: () => atfxApi.search(params),
    staleTime: STALE_MS,
    enabled: enabled && Boolean(params.object),
  })
}

export function useAtfxRecord(object: string, id: string, fields?: string) {
  return useQuery({
    queryKey: atfxKeys.record(object, id, fields),
    queryFn: () => atfxApi.record(object, id, fields),
    staleTime: STALE_MS,
    enabled: Boolean(object && id),
  })
}

export function useAtfxSoqlQuery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: SoqlQueryParams) => atfxApi.query(params),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: atfxKeys.query(variables) })
    },
  })
}

export function useLeadsByBdm(period = 'THIS_MONTH', enabled = true) {
  return useQuery({
    queryKey: atfxKeys.leadsByBdm(period),
    queryFn: () => atfxApi.leadsByBdm(period),
    staleTime: DASHBOARD_STALE_MS,
    enabled,
    ...dashboardQueryDefaults,
  })
}

export function useLeadsByCountry(days = 30, enabled = true) {
  return useQuery({
    queryKey: atfxKeys.leadsByCountry(days),
    queryFn: () => atfxApi.leadsByCountry(days),
    staleTime: DASHBOARD_STALE_MS,
    enabled,
    ...dashboardQueryDefaults,
  })
}

export function useConversionRate(days = 30, enabled = true) {
  return useQuery({
    queryKey: atfxKeys.conversionRate(days),
    queryFn: () => atfxApi.conversionRate(days),
    staleTime: DASHBOARD_STALE_MS,
    enabled,
    ...dashboardQueryDefaults,
  })
}

export function useLeadsByStatus(days = 30, country?: string, enabled = true) {
  return useQuery({
    queryKey: atfxKeys.leadsByStatus(days, country),
    queryFn: () =>
      atfxApi.aggregate({
        object: 'Lead',
        groupBy: ['Status'],
        days,
        ...(country ? { filters: { country } } : {}),
        orderBy: 'desc',
      }),
    staleTime: DASHBOARD_STALE_MS,
    enabled,
    ...dashboardQueryDefaults,
  })
}

export function useAccountsByBdm(limit = 50, enabled = true) {
  return useQuery({
    queryKey: atfxKeys.accountsByBdm(limit),
    queryFn: () =>
      atfxApi.aggregate({
        object: 'Account',
        groupBy: ['Owner.Name', 'OwnerId'],
        orderBy: 'desc',
        limit,
      }),
    staleTime: DASHBOARD_STALE_MS,
    enabled,
    ...dashboardQueryDefaults,
  })
}

// All-time leads per owner (BDM) — pairs with useAccountsByBdm to cross
// the lead and account books in the BDM leaderboard.
export const leadsByBdmAllTimeParams = (limit = 50): AggregateParams => ({
  object: 'Lead',
  groupBy: ['Owner.Name', 'OwnerId'],
  orderBy: 'desc',
  limit,
})

export function useLeadsByBdmAllTime(limit = 50, enabled = true) {
  return useQuery({
    queryKey: atfxKeys.leadsByBdmAllTime(limit),
    queryFn: () => atfxApi.aggregate(leadsByBdmAllTimeParams(limit)),
    staleTime: DASHBOARD_STALE_MS,
    enabled,
    ...dashboardQueryDefaults,
  })
}

// Accounts created in the last N days (excludes test accounts) — a real,
// non-spiky growth signal vs the bulk-migrated all-time book.
function newAccountsSoql(days: number): string {
  return (
    'SELECT COUNT(Id) c FROM Account ' +
    `WHERE AccountCreateDate__c = LAST_N_DAYS:${days} AND Is_Test_Account__c = false`
  )
}

export function useNewAccounts(days = 30, enabled = true) {
  return useQuery({
    queryKey: atfxKeys.newAccounts(days),
    queryFn: () => atfxApi.query({ query: newAccountsSoql(days) }),
    staleTime: DASHBOARD_STALE_MS,
    enabled,
    ...dashboardQueryDefaults,
  })
}

export const accountsByCountryParams = (limit = 10): AggregateParams => ({
  object: 'Account',
  groupBy: ['Country_of_Residence_Account__c'],
  orderBy: 'desc',
  limit,
})

export function useAccountsByCountry(limit = 10, enabled = true) {
  return useQuery({
    queryKey: atfxKeys.accountsByCountry(limit),
    queryFn: () => atfxApi.aggregate(accountsByCountryParams(limit)),
    staleTime: DASHBOARD_STALE_MS,
    enabled,
    ...dashboardQueryDefaults,
  })
}

// Country comes from a controlled ISO-3 picklist; validate before interpolating
// into SOQL so a malformed value can never inject into the query string.
function countrySoqlClause(country?: string): string {
  if (!country || !/^[A-Z]{3}$/.test(country)) return ''
  return ` AND Country_of_Residence_Lead__c = '${country}'`
}

// Daily granularity: lead history spans only a few weeks, so a monthly
// grouping collapses to a single point. Day buckets show the real curve.
function leadsTrendSoql(days: number, country?: string): string {
  return (
    'SELECT DAY_ONLY(CreatedDate) d, COUNT(Id) cnt ' +
    `FROM Lead WHERE CreatedDate = LAST_N_DAYS:${days}` +
    countrySoqlClause(country) +
    ' GROUP BY DAY_ONLY(CreatedDate) ' +
    'ORDER BY DAY_ONLY(CreatedDate)'
  )
}

function leadsTrendConvertedSoql(days: number): string {
  return (
    'SELECT DAY_ONLY(CreatedDate) d, COUNT(Id) cnt ' +
    `FROM Lead WHERE CreatedDate = LAST_N_DAYS:${days} AND IsConverted = true ` +
    'GROUP BY DAY_ONLY(CreatedDate) ' +
    'ORDER BY DAY_ONLY(CreatedDate)'
  )
}

export function useLeadsTrend(days = 30, country?: string, enabled = true) {
  return useQuery({
    queryKey: atfxKeys.leadsTrend(days, country),
    queryFn: () => atfxApi.query({ query: leadsTrendSoql(days, country) }),
    staleTime: DASHBOARD_STALE_MS,
    enabled,
    ...dashboardQueryDefaults,
  })
}

export function useLeadsTrendConverted(days = 30, enabled = true) {
  return useQuery({
    queryKey: atfxKeys.leadsTrendConverted(days),
    queryFn: () => atfxApi.query({ query: leadsTrendConvertedSoql(days) }),
    staleTime: DASHBOARD_STALE_MS,
    enabled,
    ...dashboardQueryDefaults,
  })
}

export function useInvalidateAtfx() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: atfxKeys.all })
}

export function useRefetchAtfx() {
  const qc = useQueryClient()
  // Manual Refresh is an explicit "get me the latest" action, so it forces
  // every active query past the BFF edge cache — the dashboard must reflect
  // the org now, not whatever the cache last stored. The MAX_CONCURRENT
  // limiter already staggers the burst. (Stale-only refetch belongs to the
  // automatic on-focus path, which goes through the warm cache without bypass.)
  return () =>
    runWithBypassCache(() =>
      qc.refetchQueries({ queryKey: atfxKeys.all, type: 'active' }),
    )
}

// Param builders for the below-the-fold widgets that fetch via useAtfxAggregate
// inline. Shared with useDashboardPrefetch so the prefetched cache entry uses
// the exact same queryKey the widget reads — keep widget call-sites on these.
export const statusFunnelParams = (
  days: number,
  country?: string,
): AggregateParams => ({
  object: 'Lead',
  groupBy: ['Status'],
  days,
  ...(country ? { filters: { country } } : {}),
  orderBy: 'desc',
  limit: 50,
})

export const unusedDemosParams = (
  limit = 12,
  country?: string,
): AggregateParams => ({
  object: 'Lead',
  groupBy: ['Owner.Name'],
  filters: { status: 'Not Used Demo', ...(country ? { country } : {}) },
  orderBy: 'desc',
  limit,
})

// Leads per BDM for a period — country-aware via the generic aggregate endpoint
// (the /dashboard/leads/by-bdm shortcut takes no country). Same SOQL otherwise.
export const leadsByBdmFilteredParams = (
  period: string,
  country?: string,
): AggregateParams => ({
  object: 'Lead',
  groupBy: ['Owner.Name'],
  period,
  ...(country ? { filters: { country } } : {}),
  orderBy: 'desc',
})

export const acquisitionChannelParams = (): AggregateParams => ({
  object: 'Account',
  groupBy: ['Client_Source__c'],
  orderBy: 'desc',
})

/**
 * Warm the deferred below-the-fold dashboard queries in the background once the
 * gate opens, so scrolling to a lazy widget hits a populated cache instead of
 * starting a fresh roundtrip. Above-the-fold queries (KPIs, area chart) already
 * fetch on mount and are skipped here. Keys mirror the widget hooks exactly, so
 * the prefetched data is the same cache entry the widget reads.
 */
export function useDashboardPrefetch(days: number, country?: string) {
  const qc = useQueryClient()
  const batchReady = useDashboardBatchReady()

  useEffect(() => {
    if (!batchReady) return
    const warm = (queryKey: QueryKey, queryFn: () => Promise<unknown>) =>
      void qc.prefetchQuery({ queryKey, queryFn, staleTime: DASHBOARD_STALE_MS })

    warm(atfxKeys.leadsByCountry(days), () => atfxApi.leadsByCountry(days))
    warm(atfxKeys.accountsByCountry(10), () =>
      atfxApi.aggregate(accountsByCountryParams(10)),
    )
    warm(atfxKeys.leadsByBdmAllTime(50), () =>
      atfxApi.aggregate(leadsByBdmAllTimeParams(50)),
    )
    const funnel = statusFunnelParams(days, country)
    warm(atfxKeys.aggregate(funnel), () => atfxApi.aggregate(funnel))
    const demos = unusedDemosParams(12, country)
    warm(atfxKeys.aggregate(demos), () => atfxApi.aggregate(demos))
    const acquisition = acquisitionChannelParams()
    warm(atfxKeys.aggregate(acquisition), () => atfxApi.aggregate(acquisition))
  }, [qc, batchReady, days, country])
}