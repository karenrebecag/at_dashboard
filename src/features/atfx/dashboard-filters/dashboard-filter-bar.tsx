import { useEffect, useState, type ReactNode } from 'react'
import { InfoTooltip } from '@/components/info-tooltip'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAtfxPicklists } from '@/lib/atfx-api'
import { useDashboardFilters } from './context'
import { DASHBOARD_DAY_OPTIONS, DASHBOARD_PERIODS } from './types'

const ALL_COUNTRIES = '__all__'

export function DashboardFilterBar({ className }: { className?: string }) {
  const { days, period, country, setDays, setPeriod, setCountry } =
    useDashboardFilters()
  // Defer heavy picklist payload until KPI queries start
  const [picklistsReady, setPicklistsReady] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => setPicklistsReady(true), 2_000)
    return () => window.clearTimeout(timer)
  }, [])
  const picklists = useAtfxPicklists('Lead', picklistsReady)

  const countryField = picklists.data?.data.fields?.find(
    (f) => f.name === 'Country_of_Residence_Lead__c',
  )
  const countryOptions =
    countryField?.picklistValues?.filter((v) => v.active) ?? []

  return (
    <div className={className} data-testid='dashboard-filter-bar'>
      <div className='flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4'>
        <FilterSelect
          label='BDM period'
          tooltip='Salesforce date literal for leads-by-BDM and period KPIs (CreatedDate).'
          value={period}
          onValueChange={setPeriod}
          triggerClassName='w-[200px]'
        >
          {DASHBOARD_PERIODS.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </FilterSelect>

        <FilterSelect
          label='Window (days)'
          tooltip='Rolling window for conversion rate, status funnel, and country charts (LAST_N_DAYS).'
          value={String(days)}
          onValueChange={(v) => setDays(Number(v))}
          triggerClassName='w-[120px]'
        >
          {DASHBOARD_DAY_OPTIONS.map((d) => (
            <SelectItem key={d} value={String(d)}>
              {d} days
            </SelectItem>
          ))}
        </FilterSelect>

        <FilterSelect
          label='Country'
          tooltip='Optional ISO-3 filter on Lead country of residence. Affects lead charts only.'
          value={country ?? ALL_COUNTRIES}
          onValueChange={(v) =>
            setCountry(v === ALL_COUNTRIES ? undefined : v)
          }
          triggerClassName='w-[160px]'
        >
          <SelectItem value={ALL_COUNTRIES}>All countries</SelectItem>
          {countryOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label || opt.value}
            </SelectItem>
          ))}
        </FilterSelect>
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  tooltip,
  value,
  onValueChange,
  triggerClassName,
  children,
}: {
  label: string
  tooltip: string
  value: string
  onValueChange: (value: string) => void
  triggerClassName?: string
  children: ReactNode
}) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1.5'>
        <Label>{label}</Label>
        <InfoTooltip content={tooltip} />
      </div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  )
}