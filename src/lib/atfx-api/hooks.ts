import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atfxApi } from './client'
import { atfxEnv } from './env'
import { atfxKeys } from './keys'
import type { AggregateParams, SearchParams, SoqlQueryParams } from './types'

const STALE_MS = atfxEnv.queryStaleMs
const DASHBOARD_STALE_MS = atfxEnv.dashboardPollMs

export function useAtfxOrg() {
  return useQuery({
    queryKey: atfxKeys.org(),
    queryFn: () => atfxApi.org(),
    staleTime: STALE_MS,
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
  params?: { mode?: string; search?: string; field?: string }
) {
  return useQuery({
    queryKey: atfxKeys.describe(sobject, params?.mode),
    queryFn: () => atfxApi.describe(sobject, params),
    staleTime: STALE_MS,
    enabled: Boolean(sobject),
  })
}

export function useAtfxPicklists(object: string) {
  return useQuery({
    queryKey: atfxKeys.picklists(object),
    queryFn: () => atfxApi.picklists(object),
    staleTime: STALE_MS,
    enabled: Boolean(object),
  })
}

export function useAtfxAggregate(params: AggregateParams) {
  return useQuery({
    queryKey: atfxKeys.aggregate(params),
    queryFn: () => atfxApi.aggregate(params),
    staleTime: STALE_MS,
    enabled: Boolean(params.object) && params.groupBy.length > 0,
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

export function useLeadsByBdm(period = 'THIS_MONTH') {
  return useQuery({
    queryKey: atfxKeys.leadsByBdm(period),
    queryFn: () => atfxApi.leadsByBdm(period),
    staleTime: DASHBOARD_STALE_MS,
    refetchInterval: DASHBOARD_STALE_MS,
  })
}

export function useLeadsByCountry(days = 30) {
  return useQuery({
    queryKey: atfxKeys.leadsByCountry(days),
    queryFn: () => atfxApi.leadsByCountry(days),
    staleTime: DASHBOARD_STALE_MS,
    refetchInterval: DASHBOARD_STALE_MS,
  })
}

export function useConversionRate(days = 30) {
  return useQuery({
    queryKey: atfxKeys.conversionRate(days),
    queryFn: () => atfxApi.conversionRate(days),
    staleTime: DASHBOARD_STALE_MS,
    refetchInterval: DASHBOARD_STALE_MS,
  })
}

export function useInvalidateAtfx() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: atfxKeys.all })
}