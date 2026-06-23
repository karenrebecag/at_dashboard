import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInvalidateAtfx } from '@/lib/atfx-api'
import { useState } from 'react'

export function RefreshButton() {
  const invalidate = useInvalidateAtfx()
  const [spinning, setSpinning] = useState(false)

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={async () => {
        setSpinning(true)
        await invalidate()
        setTimeout(() => setSpinning(false), 600)
      }}
    >
      <RefreshCw className={`me-2 h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
      Refresh data
    </Button>
  )
}