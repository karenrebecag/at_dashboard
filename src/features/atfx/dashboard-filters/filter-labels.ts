export const PERIOD_LABELS: Record<string, string> = {
  THIS_MONTH: 'This month',
  LAST_MONTH: 'Last month',
  THIS_QUARTER: 'Quarter',
  'LAST_N_DAYS:30': '30d',
}

export function formatPeriodLabel(period: string): string {
  return PERIOD_LABELS[period] ?? period
}

export function formatDaysLabel(days: number): string {
  return `${days}d`
}