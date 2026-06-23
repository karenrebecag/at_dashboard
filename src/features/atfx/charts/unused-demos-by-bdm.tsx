import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartEmptyState } from '@/components/dashboard/chart-empty-state'
import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useAtfxAggregate } from '@/lib/atfx-api'

const chartConfig = {
  demos: { label: 'Unused demos', color: 'var(--chart-3)' },
} satisfies ChartConfig

// Leads stuck at "Not Used Demo" — where the demo-to-account funnel leaks,
// grouped by the BDM that owns them.
export function UnusedDemosByBdm({
  limit = 12,
  maxHeight = 360,
}: {
  limit?: number
  maxHeight?: number
}) {
  const { data, isLoading, isError } = useAtfxAggregate({
    object: 'Lead',
    groupBy: ['Owner.Name'],
    filters: { status: 'Not Used Demo' },
    orderBy: 'desc',
    limit,
  })

  if (isLoading) return <ChartSkeleton height={320} />
  if (isError) return <ChartEmptyState message='Could not load unused demos' />

  const chartData = (data?.data?.records ?? []).map((row) => ({
    bdm: String(row.Name ?? 'Unknown'),
    demos: Number(row.cnt) || 0,
  }))

  if (chartData.length === 0) {
    return <ChartEmptyState message='No unused demos' />
  }

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
            dataKey='demos'
            fill='var(--color-demos)'
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}