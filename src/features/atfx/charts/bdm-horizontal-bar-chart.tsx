import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartEmptyState } from '@/components/dashboard/chart-empty-state'
import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useDashboardFilters } from '@/features/atfx/dashboard-filters'
import {
  leadsByBdmFilteredParams,
  useAtfxAggregate,
  useDashboardBatchReady,
} from '@/lib/atfx-api'

const chartConfig = {
  leads: { label: 'Leads', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function BdmHorizontalBarChart({
  period,
  limit = 50,
  maxHeight = 360,
}: {
  period: string
  limit?: number
  maxHeight?: number
}) {
  const { country } = useDashboardFilters()
  const batchReady = useDashboardBatchReady()
  const { data, isLoading, isError } = useAtfxAggregate(
    leadsByBdmFilteredParams(period, country),
    batchReady,
  )

  if (isLoading) return <ChartSkeleton height={320} />
  if (isError) return <ChartEmptyState message='Could not load BDM ranking' />

  const chartData = (data?.data?.records ?? []).slice(0, limit).map((row) => ({
    bdm: String(row.Name ?? 'Unknown'),
    leads: Number(row.cnt) || 0,
  }))

  if (chartData.length === 0) {
    return <ChartEmptyState message='No leads for this period' />
  }

  // Each bar gets a fixed slot; the inner chart grows past maxHeight so the
  // wrapper scrolls vertically when there are more BDMs than fit.
  const height = Math.max(240, chartData.length * 36)

  return (
    <div className='overflow-y-auto pe-1' style={{ maxHeight }}>
      <ChartContainer config={chartConfig} className='w-full' style={{ height }}>
        <BarChart
          data={chartData}
          layout='vertical'
          margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray='3 3' />
          <XAxis type='number' tickLine={false} axisLine={false} fontSize={12} />
          <YAxis
            type='category'
            dataKey='bdm'
            width={120}
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey='leads'
            fill='var(--color-leads)'
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}