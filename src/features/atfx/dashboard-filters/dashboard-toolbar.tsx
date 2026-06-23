import { useEffect, useState } from 'react'
import { InfoTooltip } from '@/components/info-tooltip'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAtfxPicklists } from '@/lib/atfx-api'
import { cn } from '@/lib/utils'
import { useDashboardFilters } from './context'
import { DASHBOARD_DAY_OPTIONS, DASHBOARD_PERIODS } from './types'

const ALL_COUNTRIES = '__all__'

const PERIOD_LABELS: Record<string, string> = {
  THIS_MONTH: 'This month',
  LAST_MONTH: 'Last month',
  THIS_QUARTER: 'Quarter',
  'LAST_N_DAYS:30': '30d',
}

export function DashboardToolbar({ className }: { className?: string }) {
  const { days, period, country, setDays, setPeriod, setCountry } =
    useDashboardFilters()

  const [picklistsReady, setPicklistsReady] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setPicklistsReady(true), 2_000)
    return () => window.clearTimeout(timer)
  }, [])

  const picklists = useAtfxPicklists('Lead', picklistsReady || countryOpen)

  const countryField = picklists.data?.data.fields?.find(
    (f) => f.name === 'Country_of_Residence_Lead__c',
  )
  const countryOptions =
    countryField?.picklistValues?.filter((v) => v.active) ?? []

  return (
    <div
      className={cn(
        // Full-bleed sticky bar — negative margin matches the fluid page padding.
        'sticky top-16 z-40 -mx-[clamp(0.75rem,3.5vw,3rem)] bg-background/75 px-[clamp(0.75rem,3.5vw,3rem)] py-3 backdrop-blur-md',
        className,
      )}
      data-testid='dashboard-filter-bar'
    >
      <div className='flex flex-wrap items-end gap-x-6 gap-y-3'>
        <FilterField label='BDM period' tooltip='Date literal for leads-by-BDM and period KPIs (CreatedDate).'>
          <Segmented
            value={period}
            onValueChange={(v) => v && setPeriod(v)}
            options={DASHBOARD_PERIODS.map((p) => ({
              value: p,
              label: PERIOD_LABELS[p] ?? p,
            }))}
          />
        </FilterField>

        <FilterField label='Window' tooltip='Rolling window for conversion, funnel, and country charts.'>
          <Segmented
            value={String(days)}
            onValueChange={(v) => v && setDays(Number(v))}
            options={DASHBOARD_DAY_OPTIONS.filter((d) =>
              [7, 30, 90].includes(d),
            ).map((d) => ({ value: String(d), label: `${d}d` }))}
          />
        </FilterField>

        <FilterField label='Country' tooltip='Filter lead charts by ISO-3 country. Click a country bar to apply.'>
          <Select
            value={country ?? ALL_COUNTRIES}
            onOpenChange={setCountryOpen}
            onValueChange={(v) =>
              setCountry(v === ALL_COUNTRIES ? undefined : v)
            }
          >
            <SelectTrigger
              size='sm'
              className='w-[150px] border-0 bg-muted shadow-none dark:bg-muted dark:hover:bg-muted/80'
            >
              <SelectValue placeholder='All' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_COUNTRIES}>All countries</SelectItem>
              {countryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label || opt.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        {country ? (
          <Badge variant='secondary' className='mb-0.5 h-8'>
            {country}
          </Badge>
        ) : null}
      </div>
    </div>
  )
}

function FilterField({
  label,
  tooltip,
  children,
}: {
  label: string
  tooltip: string
  children: React.ReactNode
}) {
  return (
    <div className='space-y-1.5'>
      <div className='flex items-center gap-1.5'>
        <Label className='text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase'>
          {label}
        </Label>
        <InfoTooltip content={tooltip} />
      </div>
      {children}
    </div>
  )
}

// Filled segmented control — no strokes, active item lifts on a card fill.
function Segmented({
  value,
  onValueChange,
  options,
}: {
  value: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <ToggleGroup
      type='single'
      variant='default'
      size='sm'
      value={value}
      onValueChange={onValueChange}
      className='gap-0.5 rounded-lg bg-muted p-0.5'
    >
      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          className='h-7 rounded-md border-0 px-2.5 text-xs text-muted-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm'
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}