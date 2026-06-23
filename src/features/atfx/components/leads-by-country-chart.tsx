import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { useLeadsByCountry } from '@/lib/atfx-api'

export function LeadsByCountryChart({ days = 30 }: { days?: number }) {
  const { data, isLoading, isError } = useLeadsByCountry(days)

  if (isLoading) return <Skeleton className='h-[350px] w-full' />
  if (isError) {
    return (
      <div className='flex h-[350px] items-center justify-center text-sm text-muted-foreground'>
        Could not load country breakdown
      </div>
    )
  }

  const chartData = (data?.data?.records ?? [])
    .slice(0, 12)
    .map((row) => ({
      name: String(row.Country_of_Residence_Lead__c ?? '—'),
      total: Number(row.cnt) || 0,
    }))

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey='name'
          stroke='hsl(var(--muted-foreground))'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='hsl(var(--muted-foreground))'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey='total' fill='hsl(var(--primary))' radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}