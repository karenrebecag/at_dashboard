import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ChartEmptyState } from '@/components/dashboard/chart-empty-state'
import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import { useAtfxSearch } from '@/lib/atfx-api'

const HOT_STATUS = 'Interested to Open Account'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function shortDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const mi = Number(m) - 1
  return mi >= 0 && mi < 12 ? `${months[mi]} ${Number(d)}, ${y}` : iso.slice(0, 10)
}

export function HotLeadsList({ limit = 50 }: { limit?: number }) {
  const { data, isLoading, isError } = useAtfxSearch({
    object: 'Lead',
    status: HOT_STATUS,
    limit,
  })

  if (isLoading) return <ChartSkeleton height={260} />
  if (isError) return <ChartEmptyState message='Could not load hot leads' />

  const rows = data?.data?.records ?? []
  if (rows.length === 0) {
    return <ChartEmptyState message='No leads ready to open an account yet' />
  }

  return (
    <ul className='divide-y'>
      {rows.map((row) => {
        const name = String(row.Name ?? 'Unknown')
        const owner = (row.Owner as { Name?: string } | undefined)?.Name ?? '—'
        const country = String(row.Country_of_Residence_Lead__c ?? '') || '—'
        const created = row.CreatedDate ? shortDate(String(row.CreatedDate)) : ''
        return (
          <li key={String(row.Id)} className='flex items-center gap-3 py-3'>
            <Avatar className='size-9'>
              <AvatarFallback className='bg-primary/15 text-xs text-foreground'>
                {initials(name)}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>{name}</p>
              <p className='truncate text-xs text-muted-foreground'>
                {owner} · {created}
              </p>
            </div>
            <Badge variant='secondary' className='shrink-0'>
              {country}
            </Badge>
          </li>
        )
      })}
    </ul>
  )
}
