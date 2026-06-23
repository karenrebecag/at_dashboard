import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ChartEmptyStateProps = {
  message: string
  actionLabel?: string
  onAction?: () => void
  height?: number
}

export function ChartEmptyState({
  message,
  actionLabel,
  onAction,
  height = 240,
}: ChartEmptyStateProps) {
  return (
    <div
      className='flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-6 text-center'
      style={{ minHeight: height }}
    >
      <BarChart3 className='size-8 text-muted-foreground/60' />
      <p className='max-w-sm text-sm text-muted-foreground'>{message}</p>
      {actionLabel && onAction ? (
        <Button variant='outline' size='sm' onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}