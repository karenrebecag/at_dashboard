import type { ComponentType } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useConversionRate,
  useLeadsByBdm,
  useLeadsByCountry,
} from '@/lib/atfx-api'
import { CacheBadge } from './cache-badge'
import { Users, Globe, TrendingUp, UserCheck } from 'lucide-react'

type KpiProps = { days?: number; period?: string }

export function KpiCards({ days = 30, period = 'THIS_MONTH' }: KpiProps) {
  const bdm = useLeadsByBdm(period)
  const country = useLeadsByCountry(days)
  const conversion = useConversionRate(days)

  const totalLeadsMonth = sumCnt(bdm.data?.data?.records)
  const topCountry = country.data?.data?.records?.[0]
  const conv = conversion.data?.data

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <KpiCard
        title='Leads this month'
        icon={Users}
        loading={bdm.isLoading}
        value={totalLeadsMonth.toLocaleString()}
        hint={`BDM breakdown · ${period}`}
        cached={bdm.data?.meta?.cached as boolean | undefined}
      />
      <KpiCard
        title={`Leads (${days}d)`}
        icon={TrendingUp}
        loading={country.isLoading}
        value={sumCnt(country.data?.data?.records).toLocaleString()}
        hint='By country aggregate'
        cached={country.data?.meta?.cached as boolean | undefined}
      />
      <KpiCard
        title='Top country'
        icon={Globe}
        loading={country.isLoading}
        value={String(topCountry?.Country_of_Residence_Lead__c ?? '—')}
        hint={
          topCountry?.cnt != null
            ? `${Number(topCountry.cnt).toLocaleString()} leads`
            : undefined
        }
        cached={country.data?.meta?.cached as boolean | undefined}
      />
      <KpiCard
        title='Conversion rate'
        icon={UserCheck}
        loading={conversion.isLoading}
        value={conv ? `${(conv.rate * 100).toFixed(1)}%` : '—'}
        hint={
          conv
            ? `${conv.converted.toLocaleString()} / ${conv.total.toLocaleString()} converted`
            : undefined
        }
        cached={conversion.data?.meta?.cached as boolean | undefined}
      />
    </div>
  )
}

function KpiCard({
  title,
  icon: Icon,
  loading,
  value,
  hint,
  cached,
}: {
  title: string
  icon: ComponentType<{ className?: string }>
  loading: boolean
  value: string
  hint?: string
  cached?: boolean
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className='h-8 w-24' />
        ) : (
          <>
            <div className='text-2xl font-bold'>{value}</div>
            {hint && <p className='text-xs text-muted-foreground'>{hint}</p>}
            <div className='mt-2'>
              <CacheBadge cached={cached} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function sumCnt(records?: Array<Record<string, unknown>>): number {
  if (!records) return 0
  return records.reduce((acc, r) => acc + (Number(r.cnt) || 0), 0)
}