import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useLeadsByBdm } from '@/lib/atfx-api'

export function TopBdmList({ period = 'THIS_MONTH', limit = 5 }: { period?: string; limit?: number }) {
  const { data, isLoading, isError } = useLeadsByBdm(period)

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {Array.from({ length: limit }).map((_, i) => (
          <Skeleton key={i} className='h-10 w-full' />
        ))}
      </div>
    )
  }

  if (isError) {
    return <p className='text-sm text-muted-foreground'>Could not load BDM ranking</p>
  }

  const rows = (data?.data?.records ?? []).slice(0, limit)

  return (
    <div className='space-y-6'>
      {rows.map((row, i) => {
        const name = String(row.Name ?? 'Unknown')
        const cnt = Number(row.cnt) || 0
        const initials = name
          .split(' ')
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
        return (
          <div key={`${name}-${i}`} className='flex items-center gap-4'>
            <Avatar className='h-9 w-9'>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 flex-wrap items-center justify-between gap-1'>
              <p className='text-sm font-medium leading-none'>{name}</p>
              <p className='text-sm text-muted-foreground'>{cnt.toLocaleString()} leads</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}