import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts'
import { ChartEmptyState } from '@/components/dashboard/chart-empty-state'
import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import { DashboardCardHeader } from '@/components/dashboard/dashboard-card-header'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useDashboardFilters } from '@/features/atfx/dashboard-filters'
import { useConversionRate, useDashboardBatchReady } from '@/lib/atfx-api'
import { formatters } from '@/lib/planner/formatters'

const chartConfig = {
  rate: { label: 'Conversion', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function ConversionRadialChart() {
  const { days } = useDashboardFilters()
  const batchReady = useDashboardBatchReady()
  const { data, isLoading, isError } = useConversionRate(days, batchReady)
  const conv = data?.data

  return (
    <Card>
      <DashboardCardHeader
        title='Lead → account conversion'
        description={`Last ${days} days`}
        tooltip='Share of leads created in the window that converted (IsConverted = true).'
      />
      <CardContent className='pb-6'>
        {isLoading ? (
          <ChartSkeleton height={220} />
        ) : isError || !conv ? (
          <ChartEmptyState message='Could not load conversion rate' height={220} />
        ) : (
          <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
            <ChartContainer
              config={chartConfig}
              className='mx-auto aspect-square h-[200px] w-[200px]'
            >
              <RadialBarChart
                data={[{ rate: conv.rate * 100, fill: 'var(--color-rate)' }]}
                startAngle={90}
                endAngle={-270}
                innerRadius={70}
                outerRadius={95}
              >
                <PolarAngleAxis
                  type='number'
                  domain={[0, 100]}
                  tick={false}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <RadialBar
                  dataKey='rate'
                  cornerRadius={8}
                  background={{ fill: 'var(--highlight-700)' }}
                />
                <text
                  x='50%'
                  y='50%'
                  textAnchor='middle'
                  dominantBaseline='middle'
                  className='fill-foreground text-2xl font-bold'
                >
                  {formatters.percentage({ number: conv.rate, decimals: 1 })}
                </text>
              </RadialBarChart>
            </ChartContainer>
            <div className='space-y-1 text-center sm:text-start'>
              <p className='text-sm text-muted-foreground'>Converted leads</p>
              <p className='text-2xl font-semibold tabular-nums'>
                {formatters.unit(conv.converted)}
              </p>
              <p className='text-sm text-muted-foreground'>
                of {formatters.unit(conv.total)} created
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}