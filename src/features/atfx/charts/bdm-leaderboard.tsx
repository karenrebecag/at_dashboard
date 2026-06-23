import { useMemo } from 'react'
import { ChartEmptyState } from '@/components/dashboard/chart-empty-state'
import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import {
  useAccountsByBdm,
  useDashboardBatchReady,
  useLeadsByBdmAllTime,
} from '@/lib/atfx-api'
import { formatters } from '@/lib/planner/formatters'

type LeaderRow = {
  name: string
  ownerId: string
  accounts: number
  leads: number
  total: number
}

// Accounts = deep navy book; Leads = bright blue pipeline
const ACCOUNTS_COLOR = 'var(--highlight-200)'
const LEADS_COLOR = 'var(--highlight)'

const RANK_BADGES = ['🥇', '🥈', '🥉'] as const

function rankDisplay(index: number): { label: string; isMedal: boolean } {
  const badge = RANK_BADGES[index]
  if (badge) return { label: badge, isMedal: true }
  return { label: String(index + 1), isMedal: false }
}

function toMap(records: Array<Record<string, unknown>> | undefined) {
  const map = new Map<string, number>()
  for (const r of records ?? []) {
    const name = String(r.Name ?? '').trim()
    if (name) map.set(name, Number(r.cnt) || 0)
  }
  return map
}

export function BdmLeaderboard({ limit = 12 }: { limit?: number }) {
  const batchReady = useDashboardBatchReady()
  const accounts = useAccountsByBdm(50, batchReady)
  const leads = useLeadsByBdmAllTime(50, batchReady)

  const rows = useMemo<LeaderRow[]>(() => {
    const accRecords = accounts.data?.data?.records ?? []
    const leadRecords = leads.data?.data?.records ?? []
    const accMap = toMap(accRecords)
    const leadMap = toMap(leadRecords)
    // BDM = Owner (a Salesforce User); OwnerId is its record id
    const idMap = new Map<string, string>()
    for (const r of [...accRecords, ...leadRecords]) {
      const name = String(r.Name ?? '').trim()
      const id = String(r.OwnerId ?? '').trim()
      if (name && id && !idMap.has(name)) idMap.set(name, id)
    }
    const names = new Set([...accMap.keys(), ...leadMap.keys()])
    return [...names]
      .map((name) => {
        const a = accMap.get(name) ?? 0
        const l = leadMap.get(name) ?? 0
        return {
          name,
          ownerId: idMap.get(name) ?? '',
          accounts: a,
          leads: l,
          total: a + l,
        }
      })
      .sort((x, y) => y.total - x.total)
      .slice(0, limit)
  }, [accounts.data, leads.data, limit])

  const isLoading = accounts.isLoading || leads.isLoading
  const isError = accounts.isError || leads.isError

  if (isLoading) return <ChartSkeleton height={420} />
  if (isError) return <ChartEmptyState message='Could not load BDM leaderboard' />
  if (rows.length === 0) return <ChartEmptyState message='No BDM activity' />

  const maxTotal = Math.max(...rows.map((r) => r.total), 1)

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4 text-xs text-muted-foreground'>
        <Legend color={ACCOUNTS_COLOR} label='Accounts' />
        <Legend color={LEADS_COLOR} label='Leads' />
        <span className='ms-auto'>Ranked by total footprint</span>
      </div>

      <ol className='space-y-3'>
        {rows.map((row, i) => {
          const width = (row.total / maxTotal) * 100
          const accPct = row.total > 0 ? (row.accounts / row.total) * 100 : 0
          const rank = rankDisplay(i)
          return (
            <li key={row.name} className='flex items-center gap-3'>
              <span
                className='w-7 shrink-0 text-center text-base leading-none'
                title={`Rank ${i + 1}`}
                aria-label={`Rank ${i + 1}`}
              >
                {rank.isMedal ? (
                  <span role='img' aria-hidden='true'>
                    {rank.label}
                  </span>
                ) : (
                  <span className='text-sm tabular-nums text-muted-foreground'>
                    {rank.label}
                  </span>
                )}
              </span>

              <div className='min-w-0 flex-1'>
                <div className='mb-1 flex items-baseline justify-between gap-2'>
                  <div className='flex min-w-0 items-baseline gap-2'>
                    <span
                      className='truncate text-sm font-medium'
                      title={row.name}
                    >
                      {row.name}
                    </span>
                    {row.ownerId ? (
                      <span
                        className='shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[0.625rem] leading-none text-muted-foreground'
                        title={`Owner ID: ${row.ownerId}`}
                      >
                        {row.ownerId}
                      </span>
                    ) : null}
                  </div>
                  <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
                    {formatters.unit(row.accounts)} acc · {formatters.unit(row.leads)} leads
                  </span>
                </div>

                <div
                  className='flex h-2.5 overflow-hidden rounded-full bg-muted'
                  style={{ width: `${Math.max(width, 4)}%` }}
                >
                  <span
                    className='h-full'
                    style={{ width: `${accPct}%`, background: ACCOUNTS_COLOR }}
                  />
                  <span
                    className='h-full flex-1'
                    style={{ background: LEADS_COLOR }}
                  />
                </div>
              </div>

              <span className='w-16 shrink-0 text-end text-sm font-semibold tabular-nums'>
                {formatters.unit(row.total)}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className='inline-flex items-center gap-1.5'>
      <span className='size-2.5 rounded-sm' style={{ background: color }} />
      {label}
    </span>
  )
}
