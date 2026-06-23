import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useRefetchAtfx } from '@/lib/atfx-api'

export function RefreshButton() {
  const refetch = useRefetchAtfx()
  const [spinning, setSpinning] = useState(false)

  return (
    <Button
      variant='outline'
      size='sm'
      disabled={spinning}
      onClick={async () => {
        setSpinning(true)
        try {
          await refetch()
          toast.success('Dashboard data refreshed')
        } catch {
          toast.error('Some requests failed — check org connection')
        } finally {
          setSpinning(false)
        }
      }}
    >
      <RefreshCw className={`me-2 h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
      Refresh data
    </Button>
  )
}