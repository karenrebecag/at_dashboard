import { Area, AreaChart } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'

const config = {
  value: { label: 'Trend', color: 'var(--chart-2)' },
} satisfies ChartConfig

type MiniSparklineProps = {
  data: number[]
  className?: string
}

export function MiniSparkline({ data, className }: MiniSparklineProps) {
  if (data.length === 0) return null

  const chartData = data.map((value, i) => ({ i, value }))

  return (
    <ChartContainer config={config} className={className ?? 'h-10 w-full'}>
      <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id='sparkFill' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='var(--color-value)' stopOpacity={0.35} />
            <stop offset='100%' stopColor='var(--color-value)' stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type='monotone'
          dataKey='value'
          stroke='var(--color-value)'
          fill='url(#sparkFill)'
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}