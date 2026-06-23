/** Map current BDM period to a comparable previous period for delta KPIs */
export function getPreviousPeriod(period: string): string {
  switch (period) {
    case 'THIS_MONTH':
      return 'LAST_MONTH'
    case 'LAST_MONTH':
      return 'LAST_N_DAYS:30'
    case 'THIS_QUARTER':
      return 'LAST_MONTH'
    case 'LAST_N_DAYS:30':
      return 'LAST_MONTH'
    default:
      return 'LAST_MONTH'
  }
}

export function periodDelta(
  current: number,
  previous: number,
): number | null {
  if (previous <= 0) return null
  return (current - previous) / previous
}