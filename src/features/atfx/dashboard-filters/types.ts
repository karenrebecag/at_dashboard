export const DASHBOARD_PERIODS = [
  'THIS_MONTH',
  'LAST_MONTH',
  'THIS_QUARTER',
  'LAST_N_DAYS:30',
] as const

export const DASHBOARD_DAY_OPTIONS = [7, 14, 30, 60, 90] as const

export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number]

export type DashboardFilters = {
  days: number
  period: string
  country?: string
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  days: 30,
  period: 'THIS_MONTH',
}