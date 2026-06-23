import { countryFlagLabel } from '@/lib/country-flag'
import { useDashboardFilters } from './context'
import { formatDaysLabel, formatPeriodLabel } from './filter-labels'
import { DEFAULT_DASHBOARD_FILTERS } from './types'
import type { WidgetFilterKey } from './widget-filter-chips'

export type WidgetFilterChip = {
  kind: WidgetFilterKey
  value: string
}

export function resolveActiveWidgetFilters(
  keys: WidgetFilterKey[],
  filters: { days: number; period: string; country?: string },
): WidgetFilterChip[] {
  const chips: WidgetFilterChip[] = []

  if (
    keys.includes('days') &&
    filters.days !== DEFAULT_DASHBOARD_FILTERS.days
  ) {
    chips.push({ kind: 'days', value: formatDaysLabel(filters.days) })
  }
  if (
    keys.includes('period') &&
    filters.period !== DEFAULT_DASHBOARD_FILTERS.period
  ) {
    chips.push({ kind: 'period', value: formatPeriodLabel(filters.period) })
  }
  if (keys.includes('country') && filters.country) {
    chips.push({ kind: 'country', value: countryFlagLabel(filters.country) })
  }

  return chips
}

export function useWidgetFilterState(keys: WidgetFilterKey[]) {
  const filters = useDashboardFilters()
  const chips = resolveActiveWidgetFilters(keys, filters)
  return { chips, isActive: chips.length > 0 }
}