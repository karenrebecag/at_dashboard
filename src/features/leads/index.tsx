import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AtfxConfigAlert } from '@/features/atfx/components/atfx-config-alert'
import { CacheBadge } from '@/features/atfx/components/cache-badge'
import { LeadsByCountryChart } from '@/features/atfx/components/leads-by-country-chart'
import { OrgStatus } from '@/features/atfx/components/org-status'
import { RefreshButton } from '@/features/atfx/components/refresh-button'
import { TopBdmList } from '@/features/atfx/components/top-bdm-list'
import { useConversionRate, useLeadsByBdm } from '@/lib/atfx-api'

const PERIODS = ['THIS_MONTH', 'LAST_MONTH', 'THIS_QUARTER', 'LAST_N_DAYS:30'] as const

export function LeadsAnalytics() {
  const [period, setPeriod] = useState<string>('THIS_MONTH')
  const [days, setDays] = useState(30)
  const conversion = useConversionRate(days)
  const bdm = useLeadsByBdm(period)

  return (
    <>
      <Header>
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Leads analytics</h1>
            <OrgStatus />
          </div>
          <RefreshButton />
        </div>

        <AtfxConfigAlert />

        <div className='mb-6 flex flex-wrap gap-4'>
          <div className='space-y-2'>
            <Label>BDM period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Country window (days)</Label>
            <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
              <SelectTrigger className='w-[120px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[7, 14, 30, 60, 90].map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Leads by BDM</CardTitle>
              <CardDescription className='flex items-center gap-2'>
                {period}
                <CacheBadge cached={bdm.data?.meta?.cached as boolean | undefined} />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TopBdmList period={period} limit={10} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion rate</CardTitle>
              <CardDescription className='flex items-center gap-2'>
                Last {days} days
                <CacheBadge
                  cached={conversion.data?.meta?.cached as boolean | undefined}
                />
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversion.isLoading ? (
                <p className='text-muted-foreground'>Loading…</p>
              ) : conversion.data?.data ? (
                <div className='space-y-2'>
                  <p className='text-4xl font-bold'>
                    {(conversion.data.data.rate * 100).toFixed(1)}%
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {conversion.data.data.converted.toLocaleString()} converted of{' '}
                    {conversion.data.data.total.toLocaleString()} leads
                  </p>
                </div>
              ) : (
                <p className='text-muted-foreground'>No data</p>
              )}
            </CardContent>
          </Card>

          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle>Leads by country</CardTitle>
              <CardDescription>Top countries in the selected window</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadsByCountryChart days={days} />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}