import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AtfxConfigAlert } from '@/features/atfx/components/atfx-config-alert'
import { KpiCards } from '@/features/atfx/components/kpi-cards'
import { LeadsByCountryChart } from '@/features/atfx/components/leads-by-country-chart'
import { OrgStatus } from '@/features/atfx/components/org-status'
import { RefreshButton } from '@/features/atfx/components/refresh-button'
import { TopBdmList } from '@/features/atfx/components/top-bdm-list'
import { Analytics } from './components/analytics'

export function Dashboard() {
  return (
    <>
      <Header>
        <TopNav links={topNav} className='me-auto' />
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>ATFX Dashboard</h1>
            <OrgStatus />
          </div>
          <RefreshButton />
        </div>

        <AtfxConfigAlert />

        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='analytics'>Analytics</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <KpiCards days={30} period='THIS_MONTH' />
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Leads by country (30d)</CardTitle>
                  <CardDescription>Live from Salesforce via REST API</CardDescription>
                </CardHeader>
                <CardContent className='ps-2'>
                  <LeadsByCountryChart days={30} />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Top BDMs</CardTitle>
                  <CardDescription>Leads created this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopBdmList period='THIS_MONTH' limit={5} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value='analytics' className='space-y-4'>
            <Analytics />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: '/',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Leads',
    href: '/leads',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Search',
    href: '/atfx/search',
    isActive: false,
    disabled: false,
  },
]