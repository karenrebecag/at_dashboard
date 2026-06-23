import { useMemo } from 'react'
import { AccountsByCountryRadarChart } from '@/features/atfx/charts/accounts-by-country-radar-chart'
import { useAccountsByCountry } from '@/lib/atfx-api'

export function AccountsByCountryChart({ limit = 10 }: { limit?: number }) {
  const { data, isLoading, isError } = useAccountsByCountry(limit)

  const chartData = useMemo(
    () =>
      (data?.data?.records ?? []).map((row) => ({
        country: String(row.Country_of_Residence_Account__c ?? '—'),
        count: Number(row.cnt) || 0,
      })),
    [data],
  )

  return (
    <AccountsByCountryRadarChart
      data={chartData}
      isLoading={isLoading}
      isError={isError}
    />
  )
}