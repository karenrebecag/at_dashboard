import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { isAtfxConfigured } from '@/lib/atfx-api'

export function AtfxConfigAlert() {
  if (isAtfxConfigured()) return null
  return (
    <Alert variant='destructive'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>ATFX API not configured</AlertTitle>
      <AlertDescription>
        Set <code className='text-xs'>VITE_ATFX_API_URL</code> and{' '}
        <code className='text-xs'>VITE_ATFX_API_TOKEN</code> in your <code>.env</code> file.
      </AlertDescription>
    </Alert>
  )
}