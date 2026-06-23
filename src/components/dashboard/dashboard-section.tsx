import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Chip } from '@/components/ui/chip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'

type DashboardSectionProps = {
  title: string
  description?: string
  defaultOpen?: boolean
  /** Optional control rendered on the right of the header (e.g. a Select) */
  action?: ReactNode
  children: ReactNode
}

// Labelled, collapsible group used to chunk the dense overview into scannable
// sections — folding one drops its cognitive load without losing the place.
export function DashboardSection({
  title,
  description,
  defaultOpen = true,
  action,
  children,
}: DashboardSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className='space-y-4'>
      <div className='flex items-center gap-3'>
        <CollapsibleTrigger className='group flex flex-1 items-center gap-3 text-start'>
          <ChevronDown className='size-4 shrink-0 text-foreground/45 transition-transform duration-200 group-data-[state=closed]:-rotate-90' />
          <Chip variant='tint'>{title}</Chip>
          {description && (
            <span className='hidden text-xs text-foreground/45 sm:inline'>
              {description}
            </span>
          )}
          <Separator className='ms-1 flex-1' />
        </CollapsibleTrigger>
        {action && <div className='shrink-0'>{action}</div>}
      </div>

      <CollapsibleContent className='space-y-4'>{children}</CollapsibleContent>
    </Collapsible>
  )
}
