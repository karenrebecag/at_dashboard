import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useWidgetFilterState } from './widget-filter-state'

export type WidgetFilterKey = 'days' | 'period' | 'country'

type WidgetFilterChipsProps = {
  keys: WidgetFilterKey[]
  className?: string
}

function FilterChip({
  kind,
  value,
}: {
  kind: WidgetFilterKey
  value: string
}) {
  const kindLabel =
    kind === 'days' ? 'Window' : kind === 'period' ? 'Period' : 'Country'

  return (
    <Badge
      variant='secondary'
      className='h-6 gap-1.5 rounded-md border-0 bg-muted/80 px-2 text-[0.6875rem] font-medium shadow-none'
    >
      <span className='text-muted-foreground'>{kindLabel}</span>
      <span>{value}</span>
    </Badge>
  )
}

export function WidgetFilterChips({ keys, className }: WidgetFilterChipsProps) {
  const { chips } = useWidgetFilterState(keys)

  if (chips.length === 0) return null

  return (
    <div
      className={cn('flex flex-wrap items-center gap-1.5', className)}
      data-testid='widget-filter-chips'
    >
      {chips.map((chip) => (
        <FilterChip key={chip.kind} kind={chip.kind} value={chip.value} />
      ))}
    </div>
  )
}