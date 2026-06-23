import { Badge } from '@/components/ui/badge'

export function CacheBadge({ cached }: { cached?: boolean }) {
  if (cached === undefined) return null
  return (
    <Badge variant={cached ? 'secondary' : 'outline'} className='text-xs font-normal'>
      {cached ? 'Redis cache' : 'Live'}
    </Badge>
  )
}