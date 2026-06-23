import type { ReactNode } from 'react'
import { InfoTooltip } from '@/components/info-tooltip'
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type DashboardCardHeaderProps = {
  title: string
  description?: ReactNode
  tooltip?: string
  action?: ReactNode
}

export function DashboardCardHeader({
  title,
  description,
  tooltip,
  action,
}: DashboardCardHeaderProps) {
  return (
    <CardHeader className='flex flex-row items-start justify-between gap-4 space-y-0'>
      <div className='min-w-0 space-y-1'>
        <div className='flex items-center gap-1.5'>
          <CardTitle className='text-base'>{title}</CardTitle>
          {tooltip ? <InfoTooltip content={tooltip} /> : null}
        </div>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </div>
      {action ? <div className='shrink-0'>{action}</div> : null}
    </CardHeader>
  )
}