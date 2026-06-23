import { useMemo } from 'react'
import { CountryInteractiveBarChart } from '@/features/atfx/charts/country-interactive-bar-chart'
import { useDashboardFilters } from '@/features/atfx/dashboard-filters'
import { useLeadsByCountry } from '@/lib/atfx-api'

export function LeadsByCountryChart() {
  const { days } = useDashboardFilters()
  const { data, isLoading, isError } = useLeadsByCountry(days)

  const chartData = useMemo(
    () =>
      (data?.data?.records ?? []).map((row) => ({
        country: String(row.Country_of_Residence_Lead__c ?? '—'),
        count: Number(row.cnt) || 0,
      })),
    [data],
  )

  return (
    <CountryInteractiveBarChart
      data={chartData}
      isLoading={isLoading}
      isError={isError}
      valueLabel='Leads'
      colorVar='--chart-1'
    />
  )
}