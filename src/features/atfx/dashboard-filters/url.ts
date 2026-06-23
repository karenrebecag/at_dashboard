import {
  DASHBOARD_DAY_OPTIONS,
  DASHBOARD_PERIODS,
  DEFAULT_DASHBOARD_FILTERS,
  type DashboardFilters,
} from './types'

const FILTER_KEYS = ['days', 'period', 'country'] as const

export function parseFiltersFromUrl(
  search: string = typeof window !== 'undefined' ? window.location.search : '',
): DashboardFilters {
  const params = new URLSearchParams(search)
  const daysRaw = params.get('days')
  const period = params.get('period')
  const country = params.get('country') ?? undefined

  let days = DEFAULT_DASHBOARD_FILTERS.days
  if (daysRaw) {
    const parsed = Number(daysRaw)
    if (
      Number.isInteger(parsed) &&
      DASHBOARD_DAY_OPTIONS.includes(parsed as (typeof DASHBOARD_DAY_OPTIONS)[number])
    ) {
      days = parsed
    }
  }

  const validPeriod =
    period && (DASHBOARD_PERIODS as readonly string[]).includes(period)
      ? period
      : DEFAULT_DASHBOARD_FILTERS.period

  return {
    days,
    period: validPeriod,
    ...(country ? { country } : {}),
  }
}

/** True when URL search already reflects these filters (filter keys only). */
export function filterKeysMatch(
  filters: DashboardFilters,
  search: string = typeof window !== 'undefined' ? window.location.search : '',
): boolean {
  const parsed = parseFiltersFromUrl(search)
  return (
    parsed.days === filters.days &&
    parsed.period === filters.period &&
    parsed.country === filters.country
  )
}

export function filtersToRouterSearch(
  filters: DashboardFilters,
  prev: Record<string, unknown> = {},
): Record<string, unknown> {
  const next = { ...prev }

  if (filters.days !== DEFAULT_DASHBOARD_FILTERS.days) {
    next.days = filters.days
  } else {
    delete next.days
  }

  if (filters.period !== DEFAULT_DASHBOARD_FILTERS.period) {
    next.period = filters.period
  } else {
    delete next.period
  }

  if (filters.country) {
    next.country = filters.country
  } else {
    delete next.country
  }

  return next
}

export function filtersToSearchParams(filters: DashboardFilters): URLSearchParams {
  const params = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : '',
  )

  for (const key of FILTER_KEYS) {
    params.delete(key)
  }

  if (filters.days !== DEFAULT_DASHBOARD_FILTERS.days) {
    params.set('days', String(filters.days))
  }
  if (filters.period !== DEFAULT_DASHBOARD_FILTERS.period) {
    params.set('period', filters.period)
  }
  if (filters.country) {
    params.set('country', filters.country)
  }

  return params
}

/** @deprecated Use TanStack Router navigate from DashboardFiltersProvider */
export function syncFiltersToUrl(filters: DashboardFilters) {
  if (typeof window === 'undefined') return

  const params = filtersToSearchParams(filters)
  const query = params.toString()
  const next = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname

  window.history.replaceState(window.history.state, '', next)
}