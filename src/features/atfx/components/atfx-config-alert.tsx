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
        Copy <code className='text-xs'>.env.example</code> to <code>.env</code> and set{' '}
        <code className='text-xs'>VITE_ATFX_API_URL</code> plus{' '}
        <code className='text-xs'>VITE_ATFX_API_TOKEN</code> (same value as{' '}
        <code className='text-xs'>MCP_ACCESS_TOKEN</code> on the API server).
      </AlertDescription>
    </Alert>
  )
}