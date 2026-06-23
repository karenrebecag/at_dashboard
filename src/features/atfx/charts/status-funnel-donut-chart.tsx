import { useMemo } from 'react'
import { Label, Pie, PieChart } from 'recharts'
import { ChartEmptyState } from '@/components/dashboard/chart-empty-state'
import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import { useDashboardFilters } from '@/features/atfx/dashboard-filters'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useAtfxAggregate } from '@/lib/atfx-api'
import { formatters } from '@/lib/planner/formatters'

const STATUS_ORDER = [
  'Not Used Demo',
  'Used Demo',
  'Interested to Open Account',
  'Pending Submitted Application',
  'Live',
  'Stage 6 - Dead',
] as const

const STATUS_KEYS: Record<(typeof STATUS_ORDER)[number], string> = {
  'Not Used Demo': 'notUsedDemo',
  'Used Demo': 'usedDemo',
  'Interested to Open Account': 'interested',
  'Pending Submitted Application': 'pending',
  Live: 'live',
  'Stage 6 - Dead': 'dead',
}

const STATUS_COLORS: Record<(typeof STATUS_ORDER)[number], string> = {
  'Not Used Demo': 'var(--chart-1)',
  'Used Demo': 'var(--chart-2)',
  'Interested to Open Account': 'var(--chart-3)',
  'Pending Submitted Application': 'var(--chart-4)',
  Live: 'var(--chart-5)',
  'Stage 6 - Dead': 'var(--highlight-200)',
}

const baseChartConfig = {
  leads: { label: 'Leads' },
  notUsedDemo: { label: 'Not Used Demo', color: STATUS_COLORS['Not Used Demo'] },
  usedDemo: { label: 'Used Demo', color: STATUS_COLORS['Used Demo'] },
  interested: {
    label: 'Interested to Open Account',
    color: STATUS_COLORS['Interested to Open Account'],
  },
  pending: {
    label: 'Pending Submitted Application',
    color: STATUS_COLORS['Pending Submitted Application'],
  },
  live: { label: 'Live', color: STATUS_COLORS.Live },
  dead: { label: 'Stage 6 - Dead', color: STATUS_COLORS['Stage 6 - Dead'] },
} satisfies ChartConfig

function slugForStatus(status: string): string {
  if (status in STATUS_KEYS) {
    return STATUS_KEYS[status as (typeof STATUS_ORDER)[number]]
  }
  return status
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

export function StatusFunnelDonutChart() {
  const { days, country, setDays } = useDashboardFilters()

  const aggregate = useAtfxAggregate({
    object: 'Lead',
    groupBy: ['Status'],
    days,
    ...(country ? { filters: { country } } : {}),
    orderBy: 'desc',
    limit: 50,
  })

  const { chartData, chartConfig, totalLeads } = useMemo(() => {
    const rows = aggregate.data?.data?.records ?? []
    const byStatus = new Map<string, number>()
    for (const row of rows) {
      byStatus.set(String(row.Status ?? '—'), Number(row.cnt) || 0)
    }

    const ordered = [
      ...STATUS_ORDER.filter((s) => byStatus.has(s)).map((status) => ({
        status,
        statusKey: STATUS_KEYS[status],
        leads: byStatus.get(status) ?? 0,
      })),
      ...[...byStatus.entries()]
        .filter(([s]) => !STATUS_ORDER.includes(s as (typeof STATUS_ORDER)[number]))
        .map(([status, leads]) => ({
          status,
          statusKey: slugForStatus(status),
          leads,
        })),
    ]

    const extraConfig: ChartConfig = { ...baseChartConfig }
    for (const { status, statusKey: key } of ordered) {
      if (!(key in extraConfig)) {
        extraConfig[key] = {
          label: status,
          color: 'var(--muted-foreground)',
        }
      }
    }

    const slices = ordered.map(({ status, statusKey: key, leads }) => ({
      status,
      statusKey: key,
      leads,
      fill: `var(--color-${key})`,
    }))

    const total = slices.reduce((sum, row) => sum + row.leads, 0)

    return { chartData: slices, chartConfig: extraConfig, totalLeads: total }
  }, [aggregate.data])

  if (aggregate.isLoading) return <ChartSkeleton height={360} />

  if (aggregate.isError) {
    return <ChartEmptyState message='Could not load status funnel' />
  }

  if (chartData.length === 0) {
    return (
      <ChartEmptyState
        message='No leads in the selected window'
        actionLabel='Widen to 90 days'
        onAction={() => setDays(90)}
      />
    )
  }

  return (
    <div className='space-y-2'>
      <ChartContainer
        config={chartConfig}
        className='mx-auto aspect-square h-[320px] w-full max-w-[360px]'
      >
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={chartData}
            dataKey='leads'
            nameKey='statusKey'
            innerRadius={72}
            outerRadius={120}
            strokeWidth={4}
            paddingAngle={2}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor='middle'
                      dominantBaseline='middle'
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className='fill-foreground text-2xl font-bold'
                      >
                        {formatters.unit(totalLeads)}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 22}
                        className='fill-muted-foreground text-xs'
                      >
                        Leads
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </Pie>
          <ChartLegend
            content={<ChartLegendContent nameKey='statusKey' className='flex-wrap gap-x-4 gap-y-1' />}
          />
        </PieChart>
      </ChartContainer>
    </div>
  )
}