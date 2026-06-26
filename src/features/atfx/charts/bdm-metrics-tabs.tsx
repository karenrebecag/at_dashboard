import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartEmptyState } from '@/components/dashboard/chart-empty-state'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IB_ACTIVATION_ENTRIES } from './ib-activation-data'
import {
  LOTS_BY_BDM,
  NET_DEPOSIT_BY_BDM,
  type BdmMetricDatum,
} from './bdm-metric-charts-data'
import { UnusedDemosByBdm } from './unused-demos-by-bdm'

const numInt = new Intl.NumberFormat('en-US')

// Reused for MIBs / Active IBs so they stay in sync with the recognition report.
function sortedByIb(metric: 'mibs' | 'activeIbs'): BdmMetricDatum[] {
  return IB_ACTIVATION_ENTRIES.map((e) => ({ bdm: e.name, value: e[metric] }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
}

function BdmMetricBarChart({
  data,
  label,
  color,
}: {
  data: BdmMetricDatum[]
  label: string
  color: string
}) {
  if (data.length === 0) return <ChartEmptyState message={`No ${label.toLowerCase()} data`} />

  const config = { value: { label, color } } satisfies ChartConfig
  const height = Math.max(240, data.length * 36)

  return (
    <div className='overflow-y-auto pe-1' style={{ maxHeight: 360 }}>
      <ChartContainer config={config} className='w-full' style={{ height }}>
        <BarChart
          data={data}
          layout='vertical'
          margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray='3 3' />
          <XAxis
            type='number'
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(v) => numInt.format(Number(v))}
          />
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
            dataKey='value'
            fill='var(--color-value)'
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}

export function BdmMetricsTabs() {
  const mibs = useMemo(() => sortedByIb('mibs'), [])
  const activeIbs = useMemo(() => sortedByIb('activeIbs'), [])

  return (
    <Tabs defaultValue='demos' className='gap-4'>
      <TabsList className='flex-wrap'>
        <TabsTrigger value='demos'>Unused demos</TabsTrigger>
        <TabsTrigger value='netDeposit'>Net Deposit</TabsTrigger>
        <TabsTrigger value='lots'>Lots</TabsTrigger>
        <TabsTrigger value='mibs'>MIBs</TabsTrigger>
        <TabsTrigger value='activeIbs'>Active IBs</TabsTrigger>
      </TabsList>

      <TabsContent value='demos'>
        <UnusedDemosByBdm limit={12} />
      </TabsContent>
      <TabsContent value='netDeposit'>
        <BdmMetricBarChart
          data={NET_DEPOSIT_BY_BDM}
          label='Net Deposit'
          color='var(--highlight)'
        />
      </TabsContent>
      <TabsContent value='lots'>
        <BdmMetricBarChart data={LOTS_BY_BDM} label='Lots' color='var(--highlight)' />
      </TabsContent>
      <TabsContent value='mibs'>
        <BdmMetricBarChart data={mibs} label='MIBs' color='var(--highlight)' />
      </TabsContent>
      <TabsContent value='activeIbs'>
        <BdmMetricBarChart data={activeIbs} label='Active IBs' color='var(--highlight)' />
      </TabsContent>
    </Tabs>
  )
}
