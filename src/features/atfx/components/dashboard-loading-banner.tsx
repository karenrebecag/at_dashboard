import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { atfxKeys } from '@/lib/atfx-api/keys'

export function DashboardLoadingBanner() {
  const fetching = useIsFetching({ queryKey: atfxKeys.all })
  const qc = useQueryClient()
  const queries = qc.getQueryCache().findAll({ queryKey: atfxKeys.all })
  const failed = queries.filter((q) => q.state.status === 'error').length

  if (fetching === 0 && failed === 0) return null

  if (failed > 0 && fetching === 0) {
    return (
      <div className='inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive'>
        <span className='size-1.5 rounded-full bg-destructive' />
        {failed} request{failed > 1 ? 's' : ''} failed · check API token, then
        Refresh
      </div>
    )
  }

  const label =
    fetching > 1
      ? `Syncing Salesforce · ${fetching} requests`
      : 'Syncing Salesforce'

  return (
    <div
      className='inline-flex items-center gap-2.5 rounded-full bg-muted/70 px-3 py-1.5'
      title='First load can take 30–60s while the API queries the org; cached responses are much faster.'
    >
      <span className='relative flex size-2'>
        <span className='absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60' />
        <span className='relative inline-flex size-2 rounded-full bg-primary' />
      </span>
      <span className='t-shimmer text-xs font-medium' data-text={label}>
        {label}
      </span>
    </div>
  )
}
