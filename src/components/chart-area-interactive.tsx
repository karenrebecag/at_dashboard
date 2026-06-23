import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { DashboardCardHeader } from '@/components/dashboard/dashboard-card-header'
import { ChartEmptyState } from '@/components/dashboard/chart-empty-state'
import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import { Card } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useIsMobile } from '@/hooks/use-mobile'
import { useDashboardFilters } from '@/features/atfx/dashboard-filters'
import { useDashboardBatchReady, useLeadsTrend } from '@/lib/atfx-api'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const RANGE_OPTIONS = [7, 30, 90] as const

const chartConfig = {
  leads: { label: 'Leads created', color: 'var(--chart-1)' },
} satisfies ChartConfig

function formatDay(iso: string): string {
  const [, mm, dd] = iso.split('-')
  const month = Number(mm)
  return month >= 1 && month <= 12
    ? `${MONTHS[month - 1]} ${Number(dd)}`
    : iso
}

export function ChartAreaInteractive() {
  const { days: filterDays } = useDashboardFilters()
  const isMobile = useIsMobile()
  const [range, setRange] = useState<number>(filterDays)

  const batchReady = useDashboardBatchReady()
  const leads = useLeadsTrend(range, batchReady)

  const chartData = useMemo(() => {
    return (leads.data?.data?.records ?? [])
      .map((row) => ({ d: String(row.d ?? ''), leads: Number(row.cnt) || 0 }))
      .filter((r) => r.d)
      .sort((a, b) => a.d.localeCompare(b.d))
      .map((r) => ({ day: formatDay(r.d), leads: r.leads }))
  }, [leads.data])

  const isLoading = leads.isLoading
  const isError = leads.isError

  const rangeControl = isMobile ? (
    <Select value={String(range)} onValueChange={(v) => setRange(Number(v))}>
      <SelectTrigger className='h-8 w-24' aria-label='Chart range'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RANGE_OPTIONS.map((d) => (
          <SelectItem key={d} value={String(d)}>
            {d}d
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : (
    <ToggleGroup
      type='single'
      variant='outline'
      size='sm'
      value={String(range)}
      onValueChange={(v) => v && setRange(Number(v))}
    >
      {RANGE_OPTIONS.map((d) => (
        <ToggleGroupItem key={d} value={String(d)} className='px-2.5'>
          {d}d
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )

  return (
    <Card>
      <DashboardCardHeader
        title='Leads created over time'
        description={`Daily · ${range} day window`}
        tooltip='Leads created per day. Chart range is independent of the global window filter.'
        action={rangeControl}
      />
      <div className='px-2 pt-2 pb-6 sm:px-6'>
        {isLoading ? (
          <ChartSkeleton height={280} />
        ) : isError ? (
          <ChartEmptyState message='Could not load lead trend' height={280} />
        ) : chartData.length === 0 ? (
          <ChartEmptyState message='No lead activity in this range' height={280} />
        ) : (
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[280px] w-full'
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id='fillLeads' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--color-leads)' stopOpacity={0.35} />
                  <stop offset='95%' stopColor='var(--color-leads)' stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='day'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
              />
              <ChartTooltip content={<ChartTooltipContent indicator='dot' />} />
              <Area
                dataKey='leads'
                type='natural'
                fill='url(#fillLeads)'
                stroke='var(--color-leads)'
                fillOpacity={1}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </Card>
  )
}
