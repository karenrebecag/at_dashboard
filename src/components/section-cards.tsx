import {
  IconBuildingBank,
  IconFlame,
  IconTrendingDown,
  IconTrendingUp,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react'
import { InfoTooltip } from '@/components/info-tooltip'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ACCOUNTS_BDM_FETCH_LIMIT } from '@/features/atfx/constants'
import { MiniSparkline } from '@/features/atfx/charts/mini-sparkline'
import { useDashboardFilters } from '@/features/atfx/dashboard-filters'
import {
  useAccountsByBdm,
  useAtfxSearch,
  useDashboardBatchReady,
  useLeadsByBdm,
  useLeadsTrend,
  useNewAccounts,
} from '@/lib/atfx-api'
import { getPreviousPeriod, periodDelta } from '@/lib/atfx-api/period-utils'
import { formatters } from '@/lib/planner/formatters'
import { cn } from '@/lib/utils'

function sumCnt(records?: Array<Record<string, unknown>>): number {
  if (!records) return 0
  return records.reduce((acc, r) => acc + (Number(r.cnt) || 0), 0)
}

export function SectionCards() {
  const { days, period } = useDashboardFilters()
  const batchReady = useDashboardBatchReady()
  const accounts = useAccountsByBdm(ACCOUNTS_BDM_FETCH_LIMIT, batchReady)
  const leads = useLeadsByBdm(period, batchReady)
  const prevLeads = useLeadsByBdm(getPreviousPeriod(period), batchReady)
  const hot = useAtfxSearch(
    { object: 'Lead', status: 'Interested to Open Account', limit: 100 },
    batchReady,
  )
  const trend = useLeadsTrend(days, batchReady)
  const newAccts = useNewAccounts(30, batchReady)

  const accountRows = accounts.data?.data?.records ?? []
  const totalAccounts = sumCnt(accountRows)
  const newAccounts = Number(newAccts.data?.data?.records?.[0]?.c) || 0
  const activeBdms = accountRows.length
  const periodLeads = sumCnt(leads.data?.data?.records)
  const prevPeriodLeads = sumCnt(prevLeads.data?.data?.records)
  const leadsDelta = periodDelta(periodLeads, prevPeriodLeads)
  const hotLeads = hot.data?.data?.records?.length ?? 0
  const topShare =
    totalAccounts > 0 ? (Number(accountRows[0]?.cnt) || 0) / totalAccounts : 0

  const sparkData = (trend.data?.data?.records ?? []).map(
    (r) => Number(r.cnt) || 0,
  )

  return (
    <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-muted/40 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs'>
      <MetricCard
        label='Total accounts'
        value={formatters.unit(totalAccounts)}
        loading={accounts.isLoading}
        badge={
          newAccts.isLoading ? undefined : `+${formatters.unit(newAccounts)} · 30d`
        }
        footerTitle='Full account book'
        footerHint={`Top BDM owns ${formatters.percentage({ number: topShare, decimals: 0 })}`}
        tooltip='Count of all Account records in the org, grouped by owner. Footer shows portfolio concentration — the share held by the single largest BDM.'
        icon={<IconBuildingBank className='size-4' />}
      />
      <MetricCard
        label={`Leads · ${period}`}
        value={formatters.unit(periodLeads)}
        loading={leads.isLoading}
        delta={leadsDelta}
        deltaLabel='vs prev'
        sparkline={sparkData}
        footerTitle='Leads created in period'
        footerHint='Source: Lead pipeline'
        tooltip='Leads with CreatedDate in the selected BDM period.'
        icon={<IconUsers className='size-4' />}
      />
      <MetricCard
        label='Hot leads'
        value={formatters.unit(hotLeads)}
        loading={hot.isLoading}
        badge='Ready to open'
        footerTitle='Interested to open account'
        footerHint='Highest-intent leads — act first'
        tooltip='Leads at Status = "Interested to Open Account" — the most actionable segment in the pipeline.'
        icon={<IconFlame className='size-4' />}
      />
      <MetricCard
        label={`Active BDMs · ${period}`}
        value={formatters.unit(activeBdms)}
        loading={accounts.isLoading}
        badge='Owners'
        footerTitle='BDMs with accounts'
        footerHint='Distinct record owners'
        tooltip='Distinct BDMs (Owners) with at least one Account.'
        icon={<IconUserCheck className='size-4' />}
        progress={activeBdms > 0 ? activeBdms / ACCOUNTS_BDM_FETCH_LIMIT : 0}
      />
    </div>
  )
}

function TrendBadge({
  delta,
  label,
}: {
  delta: number | null
  label: string
}) {
  if (delta === null) return null
  const up = delta >= 0
  const Icon = up ? IconTrendingUp : IconTrendingDown
  return (
    <Badge
      variant='outline'
      className={cn(
        // metric delta, not an eyebrow tag — opt out of the global mono/uppercase
        'max-w-full gap-1 font-sans text-[0.7rem] tracking-normal normal-case tabular-nums',
        up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
      )}
    >
      <Icon className='size-3 shrink-0' />
      {formatters.percentage({ number: Math.abs(delta), decimals: 1 })}
      <span className='truncate font-normal text-muted-foreground'>{label}</span>
    </Badge>
  )
}

function MetricCard({
  label,
  value,
  loading,
  badge,
  delta,
  deltaLabel,
  sparkline,
  progress,
  footerTitle,
  footerHint,
  tooltip,
  icon,
}: {
  label: string
  value: string
  loading: boolean
  badge?: string
  delta?: number | null
  deltaLabel?: string
  sparkline?: number[]
  progress?: number
  footerTitle: string
  footerHint?: string
  tooltip: string
  icon: React.ReactNode
}) {
  return (
    <Card className='@container/card'>
      <CardHeader>
        <div className='flex items-center gap-1.5'>
          <CardDescription>{label}</CardDescription>
          <InfoTooltip content={tooltip} />
        </div>
        <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
          {loading ? <Skeleton className='h-8 w-24' /> : value}
        </CardTitle>
        <CardAction className='flex flex-col items-end gap-1'>
          {delta !== undefined && deltaLabel ? (
            <TrendBadge delta={delta ?? null} label={deltaLabel} />
          ) : null}
          {badge ? <Badge variant='outline'>{badge}</Badge> : null}
        </CardAction>
      </CardHeader>
      {sparkline && sparkline.length > 1 ? (
        <div className='px-6 pb-2'>
          <MiniSparkline data={sparkline} />
        </div>
      ) : null}
      {progress !== undefined ? (
        <div className='px-6 pb-2'>
          <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
            <div
              className='h-full rounded-full bg-primary transition-all'
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      ) : null}
      <CardFooter className='flex-col items-start gap-1.5 text-sm'>
        <div className='line-clamp-1 flex gap-2 font-medium'>
          {footerTitle} {icon}
        </div>
        {footerHint && <div className='text-muted-foreground'>{footerHint}</div>}
      </CardFooter>
    </Card>
  )
}