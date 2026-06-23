import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'
import { ChartEmptyState } from '@/components/dashboard/chart-empty-state'
import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import { useDashboardFilters } from '@/features/atfx/dashboard-filters'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'

type CountryRow = { country: string; count: number }

type CountryInteractiveBarChartProps = {
  data: CountryRow[]
  isLoading: boolean
  isError: boolean
  valueLabel: string
  colorVar?: string
  onEmptyWiden?: () => void
}

export function CountryInteractiveBarChart({
  data,
  isLoading,
  isError,
  valueLabel,
  colorVar = '--chart-3',
  onEmptyWiden,
}: CountryInteractiveBarChartProps) {
  const { country, setCountry, setDays } = useDashboardFilters()

  const chartConfig = useMemo(
    () =>
      ({
        count: { label: valueLabel, color: `var(${colorVar})` },
      }) satisfies ChartConfig,
    [valueLabel, colorVar],
  )

  if (isLoading) return <ChartSkeleton height={320} />
  if (isError) return <ChartEmptyState message={`Could not load ${valueLabel.toLowerCase()} by country`} />

  const chartData = data.slice(0, 12)

  if (chartData.length === 0) {
    return (
      <ChartEmptyState
        message='No records in the selected window'
        actionLabel='Widen to 90 days'
        onAction={onEmptyWiden ?? (() => setDays(90))}
      />
    )
  }

  return (
    <ChartContainer config={chartConfig} className='h-[320px] w-full'>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis
          dataKey='country'
          tickLine={false}
          axisLine={false}
          fontSize={11}
          angle={-35}
          textAnchor='end'
          height={64}
        />
        <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey='count' radius={[4, 4, 0, 0]} maxBarSize={40}>
          {chartData.map((entry) => {
            const active = country === entry.country
            return (
              <Cell
                key={entry.country}
                cursor='pointer'
                className={cn(active && 'opacity-100')}
                fill={active ? 'var(--primary)' : 'var(--color-count)'}
                onClick={() => {
                  if (entry.country === '—') return
                  setCountry(active ? undefined : entry.country)
                }}
              />
            )
          })}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}