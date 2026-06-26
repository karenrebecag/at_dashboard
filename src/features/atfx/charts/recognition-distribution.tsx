import { Pie, PieChart } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { RECOGNITION_DISTRIBUTION } from './recognition-distribution-data'

const chartConfig = RECOGNITION_DISTRIBUTION.reduce<ChartConfig>((acc, slice) => {
  acc[slice.key] = { label: `${slice.tier} (${slice.percent}%)`, color: slice.color }
  return acc
}, {})

const chartData = RECOGNITION_DISTRIBUTION.map((slice) => ({
  key: slice.key,
  percent: slice.percent,
  fill: `var(--color-${slice.key})`,
}))

export function RecognitionDistribution() {
  return (
    <ChartContainer
      config={chartConfig}
      className='mx-auto aspect-square h-[300px] w-full max-w-[340px]'
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              nameKey='key'
              formatter={(value) => `${value}%`}
            />
          }
        />
        <Pie
          data={chartData}
          dataKey='percent'
          nameKey='key'
          outerRadius={110}
          strokeWidth={2}
        />
        <ChartLegend
          content={
            <ChartLegendContent
              nameKey='key'
              className='flex-wrap gap-x-4 gap-y-1'
            />
          }
        />
      </PieChart>
    </ChartContainer>
  )
}
