import { useMemo } from 'react'
import { ChartEmptyState } from '@/components/dashboard/chart-empty-state'
import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import { useAtfxAggregate } from '@/lib/atfx-api'
import { formatters } from '@/lib/planner/formatters'

// Acquisition channel mix (Client_Source__c). Brand-coherent palette:
// direct routes = green cluster, IB-driven routes = sea cluster.
const SOURCE_COLORS: Record<string, string> = {
  'Direct Client': 'var(--highlight)',
  'Direct IB': 'var(--highlight-200)',
  'IB Client': 'var(--sea-300)',
  'IB By IB': 'var(--sea-100)',
}
const FALLBACK_COLOR = 'var(--muted-foreground)'

export function AccountSourceBreakdown() {
  const { data, isLoading, isError } = useAtfxAggregate({
    object: 'Account',
    groupBy: ['Client_Source__c'],
    orderBy: 'desc',
  })

  const rows = useMemo(() => {
    return (data?.data?.records ?? [])
      .map((r) => ({
        source: String(r.Client_Source__c ?? '').trim(),
        count: Number(r.cnt) || 0,
      }))
      .filter((r) => r.source)
  }, [data])

  if (isLoading) return <ChartSkeleton height={140} />
  if (isError) return <ChartEmptyState message='Could not load account sources' height={140} />
  if (rows.length === 0) return <ChartEmptyState message='No source data' height={140} />

  const total = rows.reduce((acc, r) => acc + r.count, 0)
  const colorFor = (s: string) => SOURCE_COLORS[s] ?? FALLBACK_COLOR

  return (
    <div className='space-y-4'>
      <div className='flex h-3 w-full overflow-hidden rounded-full bg-muted'>
        {rows.map((r) => (
          <span
            key={r.source}
            className='h-full'
            style={{
              width: `${total > 0 ? (r.count / total) * 100 : 0}%`,
              background: colorFor(r.source),
            }}
            title={`${r.source}: ${formatters.unit(r.count)}`}
          />
        ))}
      </div>

      <ul className='grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2'>
        {rows.map((r) => {
          const share = total > 0 ? r.count / total : 0
          return (
            <li key={r.source} className='flex items-center gap-2 text-sm'>
              <span
                className='size-2.5 shrink-0 rounded-sm'
                style={{ background: colorFor(r.source) }}
              />
              <span className='flex-1 truncate'>{r.source}</span>
              <span className='shrink-0 tabular-nums text-muted-foreground'>
                {formatters.unit(r.count)} ·{' '}
                {formatters.percentage({ number: share, decimals: 1 })}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
