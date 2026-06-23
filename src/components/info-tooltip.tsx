import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type InfoTooltipProps = {
  content: string
  className?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function InfoTooltip({
  content,
  className,
  side = 'top',
}: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          className={cn(
            'inline-flex shrink-0 text-muted-foreground transition-colors hover:text-foreground',
            className,
          )}
          aria-label='More information'
        >
          <Info className='size-3.5' />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className='max-w-xs text-pretty'>
        {content}
      </TooltipContent>
    </Tooltip>
  )
}