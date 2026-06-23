import { cn } from '@/lib/utils'
import { WidgetFilterChips } from './widget-filter-chips'
import type { WidgetFilterKey } from './widget-filter-chips'
import { useWidgetFilterState } from './widget-filter-state'

export function WidgetFilterFooter({ keys }: { keys: WidgetFilterKey[] }) {
  const { isActive } = useWidgetFilterState(keys)

  return (
    <div
      className={cn(
        'mt-auto flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t px-6 py-3',
        isActive ? 'border-primary/20' : 'border-border/60',
      )}
      data-testid='widget-filter-footer'
    >
      <span className='shrink-0 text-[0.6875rem] font-medium text-muted-foreground'>
        Data Affected by filters:
      </span>
      {isActive ? (
        <WidgetFilterChips keys={keys} />
      ) : (
        <span className='text-[0.6875rem] text-muted-foreground/75'>
          Defaults
        </span>
      )}
    </div>
  )
}