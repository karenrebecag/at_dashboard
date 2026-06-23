import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardFilters } from '@/features/atfx/dashboard-filters'
import { formatters } from '@/lib/planner/formatters'
import { useLeadsByStatus } from '@/lib/atfx-api'

export function StatusBreakdownCards() {
  const { days, country } = useDashboardFilters()
  const { data, isLoading, isError } = useLeadsByStatus(days, country)

  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-24 w-full' />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className='text-sm text-muted-foreground'>
        Could not load status breakdown
      </p>
    )
  }

  const rows = data?.data?.records ?? []
  const total = rows.reduce((acc, r) => acc + (Number(r.cnt) || 0), 0)

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
      {rows.map((row, i) => {
        const status = String(row.Status ?? '—')
        const cnt = Number(row.cnt) || 0
        const share = total > 0 ? cnt / total : 0
        return (
          <Card key={`${status}-${i}`}>
            <CardContent className='pt-6'>
              <p className='truncate text-sm font-medium' title={status}>
                {status}
              </p>
              <p className='mt-2 text-2xl font-bold tabular-nums'>
                {formatters.unit(cnt)}
              </p>
              <div className='mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted'>
                <div
                  className='h-full rounded-full bg-primary'
                  style={{ width: `${Math.round(share * 100)}%` }}
                />
              </div>
              <p className='mt-1.5 text-xs text-muted-foreground'>
                {formatters.percentage({ number: share, decimals: 1 })} of leads
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
