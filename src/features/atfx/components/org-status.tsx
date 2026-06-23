import { Skeleton } from '@/components/ui/skeleton'
import { useAtfxOrg } from '@/lib/atfx-api'

export function OrgStatus() {
  const { data, isLoading, isError } = useAtfxOrg()

  if (isLoading) return <Skeleton className='h-5 w-48' />
  if (isError) return <span className='text-sm text-destructive'>Org disconnected</span>

  const org = data?.data
  return (
    <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
      <span>
        {org?.username} · {org?.connectedStatus}
      </span>
    </div>
  )
}