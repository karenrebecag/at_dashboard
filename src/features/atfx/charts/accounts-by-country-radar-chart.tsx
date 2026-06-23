import { useMemo } from 'react'
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  type DotItemDotProps,
} from 'recharts'
import { ChartEmptyState } from '@/components/dashboard/chart-empty-state'
import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import { useDashboardFilters } from '@/features/atfx/dashboard-filters'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { countryFlagEmoji, countryFlagLabel } from '@/lib/country-flag'
import { cn } from '@/lib/utils'

const chartConfig = {
  accounts: {
    label: 'Accounts',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

type CountryRow = { country: string; count: number }

type AccountsByCountryRadarChartProps = {
  data: CountryRow[]
  isLoading: boolean
  isError: boolean
  maxHeight?: number
}

export function AccountsByCountryRadarChart({
  data,
  isLoading,
  isError,
  maxHeight = 320,
}: AccountsByCountryRadarChartProps) {
  const { country, setCountry } = useDashboardFilters()

  const chartData = useMemo(
    () =>
      data
        .filter((row) => row.country !== '—')
        .slice(0, 10)
        .map((row) => ({
          country: row.country,
          flag: countryFlagEmoji(row.country),
          accounts: row.count,
        })),
    [data],
  )

  if (isLoading) return <ChartSkeleton height={maxHeight} />
  if (isError) {
    return <ChartEmptyState message='Could not load accounts by country' />
  }

  if (chartData.length === 0) {
    return <ChartEmptyState message='No accounts by country' />
  }

  const handleCountryClick = (code: string | undefined) => {
    if (!code || code === '—') return
    setCountry(country === code ? undefined : code)
  }

  return (
    <ChartContainer
      config={chartConfig}
      className={cn(
        'mx-auto aspect-square w-full max-h-[320px]',
        country && 'opacity-100',
      )}
      style={{ height: maxHeight, maxHeight }}
    >
      <RadarChart data={chartData} cx='50%' cy='50%' outerRadius='78%'>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator='line'
              labelFormatter={(_, payload) => {
                const code = (
                  payload?.[0]?.payload as { country?: string } | undefined
                )?.country
                return code ? countryFlagLabel(code) : ''
              }}
            />
          }
        />
        <PolarGrid stroke='var(--border)' />
        <PolarAngleAxis
          dataKey='flag'
          tick={{ fill: 'var(--foreground)', fontSize: 18 }}
        />
        <Radar
          name='accounts'
          dataKey='accounts'
          fill='var(--color-accounts)'
          fillOpacity={0.55}
          stroke='var(--color-accounts)'
          strokeWidth={2}
          dot={(props: DotItemDotProps) => {
            const code = (props.payload as { country?: string } | undefined)
              ?.country
            const active = code != null && country === code
            return (
              <circle
                key={`${code ?? 'dot'}-${props.index}`}
                cx={props.cx}
                cy={props.cy}
                r={active ? 6 : 4}
                fill='var(--color-accounts)'
                fillOpacity={1}
                stroke={active ? 'var(--foreground)' : 'var(--background)'}
                strokeWidth={active ? 2 : 1}
                className='cursor-pointer'
                onClick={() => handleCountryClick(code)}
              />
            )
          }}
        />
      </RadarChart>
    </ChartContainer>
  )
}