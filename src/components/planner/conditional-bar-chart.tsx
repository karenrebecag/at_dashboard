import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  type AvailableChartColorsKeys,
  getConditionalColorClassName,
  getGradientColorClassName,
} from '@/lib/planner/chart-utils'
import { formatters } from '@/lib/planner/formatters'
import { cn } from '@/lib/utils'

type ChartRow = Record<string, string | number>

type ConditionalBarChartProps = {
  data: ChartRow[]
  indexKey: string
  valueKey: string
  color?: AvailableChartColorsKeys
  className?: string
  height?: number
  valueFormatter?: (value: number) => string
  valueLabel?: string
}

function barValue(value: unknown): number {
  if (Array.isArray(value)) return Number(value[1] ?? value[0]) || 0
  return Number(value) || 0
}

function ConditionalBarShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  value,
  maxValue,
  color,
}: {
  x?: number
  y?: number
  width?: number
  height?: number
  value?: unknown
  maxValue: number
  color: AvailableChartColorsKeys
}) {
  const ratio = maxValue > 0 ? barValue(value) / maxValue : 0
  const h = Math.abs(height)
  const adjustedY = height < 0 ? y + height : y

  return (
    <rect
      x={x}
      y={adjustedY}
      width={width}
      height={h}
      rx={4}
      ry={4}
      className={getConditionalColorClassName(ratio, color)}
    />
  )
}

function ChartLegend({ color }: { color: AvailableChartColorsKeys }) {
  return (
    <div className='mb-3 flex items-center justify-end gap-2'>
      <span className='text-xs text-muted-foreground'>Low</span>
      <span
        className={cn(
          getGradientColorClassName(color),
          'h-1.5 w-14 rounded-full bg-linear-to-r',
        )}
      />
      <span className='text-xs text-muted-foreground'>High</span>
    </div>
  )
}

function BarChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  valueLabel,
}: {
  active?: boolean
  payload?: Array<{ value?: unknown }>
  label?: string
  valueFormatter: (value: number) => string
  valueLabel: string
}) {
  if (!active || !payload?.length) return null

  const value = barValue(payload[0]?.value)

  return (
    <div className='rounded-md border bg-popover px-3 py-2 text-sm shadow-md'>
      <p className='font-medium text-popover-foreground'>{label}</p>
      <p className='text-muted-foreground'>
        {valueFormatter(value)} {valueLabel}
      </p>
    </div>
  )
}

/** Simplified conditional bar chart from template-planner */
export function ConditionalBarChart({
  data,
  indexKey,
  valueKey,
  color = 'gray',
  className,
  height = 350,
  valueFormatter = formatters.unit,
  valueLabel = 'Count',
}: ConditionalBarChartProps) {
  const maxValue = Math.max(
    ...data.map((row) => Number(row[valueKey]) || 0),
    1,
  )

  return (
    <div className={className}>
      <ChartLegend color={color} />
      <ResponsiveContainer width='100%' height={height}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid
            vertical={false}
            strokeDasharray='3 3'
            className='stroke-border'
          />
          <XAxis
            dataKey={indexKey}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            className='fill-muted-foreground'
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            className='fill-muted-foreground'
            tickFormatter={(v) => valueFormatter(Number(v))}
          />
          <Tooltip
            cursor={{ className: 'fill-muted/30' }}
            content={
              <BarChartTooltip
                valueFormatter={valueFormatter}
                valueLabel={valueLabel}
              />
            }
          />
          <Bar
            dataKey={valueKey}
            shape={(props) => {
              const { x, y, width, height, value } = props
              return (
                <ConditionalBarShape
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  value={value}
                  maxValue={maxValue}
                  color={color}
                />
              )
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}