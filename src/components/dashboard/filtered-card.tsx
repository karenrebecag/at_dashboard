import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { WidgetFilterFooter } from '@/features/atfx/dashboard-filters/widget-filter-footer'
import { useWidgetFilterState } from '@/features/atfx/dashboard-filters/widget-filter-state'
import type { WidgetFilterKey } from '@/features/atfx/dashboard-filters/widget-filter-chips'
import { cn } from '@/lib/utils'

type FilteredCardProps = {
  filterKeys?: WidgetFilterKey[]
  className?: string
  children: ReactNode
}

export function FilteredCard({
  filterKeys,
  className,
  children,
}: FilteredCardProps) {
  const { isActive } = useWidgetFilterState(filterKeys ?? [])

  return (
    <Card
      className={cn(
        isActive &&
          'border-primary/55 ring-1 ring-primary/20 transition-[border-color,box-shadow]',
        className,
      )}
      data-filter-active={isActive || undefined}
    >
      {children}
      {filterKeys?.length ? <WidgetFilterFooter keys={filterKeys} /> : null}
    </Card>
  )
}