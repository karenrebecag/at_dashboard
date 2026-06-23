import { useMemo } from 'react'
import { ChartEmptyState } from '@/components/dashboard/chart-empty-state'
import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import { WorldMap } from '@/components/shadcnmaps/maps/world'
import type { MapRegionData } from '@/components/shadcnmaps/types'
import { useDashboardFilters } from '@/features/atfx/dashboard-filters'
import {
  LEADS_COUNTRY_MAP_BUCKETS,
  leadsCountryMapClass,
} from '@/features/atfx/charts/leads-country-map-scale'
import { useDashboardBatchReady, useLeadsByCountry } from '@/lib/atfx-api'
import { formatters } from '@/lib/planner/formatters'
import { cn } from '@/lib/utils'

import { ISO3_TO_ISO2 } from '@/lib/country-flag'

function levelFor(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 1
  return Math.min(5, Math.max(1, Math.ceil((5 * Math.log(count + 1)) / Math.log(max + 1))))
}

export function LeadsByCountryMap() {
  const { days } = useDashboardFilters()
  const batchReady = useDashboardBatchReady()
  const { data, isLoading, isError } = useLeadsByCountry(days, batchReady)

  const regions = useMemo(() => {
    const records = data?.data?.records ?? []
    const counts = records
      .map((r) => ({
        iso2: ISO3_TO_ISO2[String(r.Country_of_Residence_Lead__c ?? '').toUpperCase()],
        count: Number(r.cnt) || 0,
      }))
      .filter((r) => r.iso2)

    const max = counts.reduce((m, r) => Math.max(m, r.count), 0)

    return counts.map(({ iso2, count }) => ({
      id: iso2,
      className: leadsCountryMapClass(levelFor(count, max)),
      metadata: { leads: count },
    }))
  }, [data])

  if (isLoading) return <ChartSkeleton height={360} />
  if (isError) return <ChartEmptyState message='Could not load country map' />
  if (regions.length === 0) {
    return <ChartEmptyState message='No country data for this window' />
  }

  return (
    <div className='leads-country-map space-y-3'>
      <WorldMap
        regions={regions}
        showLabels={false}
        className='h-auto w-full'
        aria-label='Leads by country'
        renderTooltip={renderTooltip}
      />
      <div className='flex items-center justify-end gap-2 text-xs text-muted-foreground'>
        <span>Fewer</span>
        {LEADS_COUNTRY_MAP_BUCKETS.map(({ level, swatchClass }) => (
          <span
            key={level}
            className={cn('size-3 rounded-sm', swatchClass)}
            title={`Bucket ${level}`}
          />
        ))}
        <span>More leads</span>
      </div>
    </div>
  )
}

function renderTooltip(region: MapRegionData) {
  const leads = region.metadata?.leads
  if (typeof leads === 'number') {
    return `${region.name}: ${formatters.unit(leads)} leads`
  }
  return region.name
}