import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { DashboardCardHeader } from '@/components/dashboard/dashboard-card-header'
import { FilteredCard } from '@/components/dashboard/filtered-card'
import { DashboardSection } from '@/components/dashboard/dashboard-section'
import { LazyMount } from '@/components/dashboard/lazy-mount'
import { SiteHeader } from '@/components/dashboard/site-header'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { SectionCards } from '@/components/section-cards'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent } from '@/components/ui/card'
import { AccountsBdmDataTable } from '@/features/atfx/components/accounts-bdm-data-table'
import { AccountsByCountryChart } from '@/features/atfx/components/accounts-by-country-chart'
import { AtfxConfigAlert } from '@/features/atfx/components/atfx-config-alert'
import { DashboardLoadingBanner } from '@/features/atfx/components/dashboard-loading-banner'
import { LeadsByCountryMap } from '@/features/atfx/charts/leads-by-country-map'
import { CopyConnectionPrompt } from '@/features/atfx/components/copy-connection-prompt'
import { RefreshButton } from '@/features/atfx/components/refresh-button'
import { BdmHorizontalBarChart } from '@/features/atfx/charts/bdm-horizontal-bar-chart'
import { AccountSourceBreakdown } from '@/features/atfx/charts/account-source-breakdown'
import { BdmLeaderboard } from '@/features/atfx/charts/bdm-leaderboard'
import { HotLeadsList } from '@/features/atfx/charts/hot-leads-list'
import { SchemaExplorer } from '@/features/atfx/charts/schema-explorer'
import { StatusFunnelDonutChart } from '@/features/atfx/charts/status-funnel-donut-chart'
import { UnusedDemosByBdm } from '@/features/atfx/charts/unused-demos-by-bdm'
import {
  DashboardToolbar,
  useDashboardFilters,
} from '@/features/atfx/dashboard-filters'
import { useDashboardPrefetch } from '@/lib/atfx-api'

// Fluid side padding — scales with viewport, smaller on mobile
const DASHBOARD_PAD = 'w-full px-[clamp(0.75rem,3.5vw,3rem)]'

export function Dashboard() {
  const { days, period, country } = useDashboardFilters()
  // Warm the deferred below-fold queries while the user reads the KPIs.
  useDashboardPrefetch(days, country)

  return (
    <>
      <Header>
        <div className='ms-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main fluid className='px-0'>
        <div className='@container/main mx-auto flex w-full max-w-none flex-col gap-6 py-6 lg:max-w-[85%]'>
          <div className={DASHBOARD_PAD}>
            <SiteHeader
              section='Overview'
              actions={
                <>
                  <RefreshButton />
                  <CopyConnectionPrompt />
                </>
              }
            />
            <AtfxConfigAlert className='mt-4' />
            <DashboardLoadingBanner />
          </div>

          <div className={DASHBOARD_PAD}>
            <DashboardToolbar />
          </div>

          <div className={`${DASHBOARD_PAD} osmo-stagger flex flex-col gap-8`}>
            {/* Headline KPIs stay pinned — the one thing always in view */}
            <SectionCards />

            <DashboardSection
              title='Geography'
              description='Where leads come from'
            >
              <FilteredCard filterKeys={['days']}>
                <DashboardCardHeader
                  title='Leads by country'
                  description={`Geographic distribution · last ${days} days`}
                  tooltip='Lead volume by ISO country (Country_of_Residence_Lead__c), shaded by intensity. Hover a country for its lead count.'
                />
                <CardContent className='pb-4'>
                  <LazyMount height={360}>
                    <LeadsByCountryMap />
                  </LazyMount>
                </CardContent>
              </FilteredCard>
            </DashboardSection>

            <DashboardSection
              title='Lead pipeline'
              description='Trend, funnel, hot leads and where demos leak'
            >
              <ChartAreaInteractive />

              <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
                <FilteredCard
                  filterKeys={['days', 'country']}
                  className='xl:col-span-7'
                >
                  <DashboardCardHeader
                    title='Pipeline by status'
                    description={`Lead funnel · last ${days} days`}
                    tooltip='Grouped lead counts by Salesforce Status picklist.'
                  />
                  <CardContent className='px-2 pb-4'>
                    <LazyMount height={360}>
                      <StatusFunnelDonutChart />
                    </LazyMount>
                  </CardContent>
                </FilteredCard>

                <FilteredCard
                  filterKeys={['period', 'country']}
                  className='xl:col-span-5'
                >
                  <DashboardCardHeader
                    title='Leads by BDM'
                    description={period}
                    tooltip='Leads created in the selected BDM period, ranked by Owner.'
                  />
                  <CardContent>
                    <LazyMount height={320}>
                      <BdmHorizontalBarChart period={period} />
                    </LazyMount>
                  </CardContent>
                </FilteredCard>
              </div>

              <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
                <FilteredCard
                  filterKeys={['country']}
                  className='xl:col-span-5'
                >
                  <DashboardCardHeader
                    title='Hot leads'
                    description='Interested to open an account · act first'
                    tooltip='Leads at Status = "Interested to Open Account" — the highest-intent segment, with owner and country.'
                  />
                  <CardContent className='pb-2'>
                    <LazyMount height={300}>
                      <HotLeadsList />
                    </LazyMount>
                  </CardContent>
                </FilteredCard>

                <FilteredCard
                  filterKeys={['country']}
                  className='xl:col-span-7'
                >
                  <DashboardCardHeader
                    title='Unused demos by BDM'
                    description='Leads stuck at "Not Used Demo"'
                    tooltip='Where the demo-to-account funnel leaks: leads that requested a demo but never used it, grouped by owning BDM.'
                  />
                  <CardContent className='px-2 pb-4'>
                    <LazyMount height={360}>
                      <UnusedDemosByBdm limit={12} />
                    </LazyMount>
                  </CardContent>
                </FilteredCard>
              </div>
            </DashboardSection>

            <DashboardSection
              title='BDM & account book'
              description='Performance leaderboard and account distribution'
            >
              <Card>
                <DashboardCardHeader
                  title='BDM activity leaderboard'
                  description='Accounts + leads per BDM · ranked by total footprint'
                  tooltip='Cross-references each BDM&apos;s account book and lead book (both grouped by Owner, all-time). The split bar shows the accounts-vs-leads mix; lead owners and account owners are often different people.'
                />
                <CardContent className='pb-4'>
                  <LazyMount height={420}>
                    <BdmLeaderboard limit={12} />
                  </LazyMount>
                </CardContent>
              </Card>

              <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
                <Card className='xl:col-span-7'>
                  <DashboardCardHeader
                    title='Accounts by BDM'
                    description='Sortable book · search · pagination'
                    tooltip='All Account records grouped by Owner (BDM).'
                  />
                  <CardContent>
                    <LazyMount height={360}>
                      <AccountsBdmDataTable />
                    </LazyMount>
                  </CardContent>
                </Card>

                <Card className='xl:col-span-5'>
                  <DashboardCardHeader
                    title='Accounts by country'
                    description='Top countries · click to filter leads'
                    tooltip='Country on Account. Click a point to set lead country filter.'
                  />
                  <CardContent className='px-2 pb-4 pt-1'>
                    <LazyMount height={320}>
                      <AccountsByCountryChart limit={10} />
                    </LazyMount>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <DashboardCardHeader
                  title='Acquisition channel'
                  description='How the account book was sourced'
                  tooltip='Account book by Client Source — direct sign-ups vs accounts brought in through Introducing Brokers (IB).'
                />
                <CardContent className='pb-5'>
                  <LazyMount height={140}>
                    <AccountSourceBreakdown />
                  </LazyMount>
                </CardContent>
              </Card>
            </DashboardSection>

            <DashboardSection
              title='Developer tools'
              description='Salesforce schema & field mapping'
              defaultOpen={false}
            >
              <Card>
                <DashboardCardHeader
                  title='Schema explorer'
                  description='Objects, fields, types and picklists exposed by the API'
                  tooltip='Live /describe of each sObject — the available data dictionary. Reference for building new widgets and queries.'
                />
                <CardContent>
                  <LazyMount height={320}>
                    <SchemaExplorer />
                  </LazyMount>
                </CardContent>
              </Card>
            </DashboardSection>
          </div>
        </div>
      </Main>
    </>
  )
}
