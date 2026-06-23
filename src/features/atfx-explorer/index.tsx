import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AtfxConfigAlert } from '@/features/atfx/components/atfx-config-alert'
import { OrgStatus } from '@/features/atfx/components/org-status'
import { RefreshButton } from '@/features/atfx/components/refresh-button'
import { useAtfxIndex, useAtfxOrg, useAtfxPicklists } from '@/lib/atfx-api'

/** Dev reference — all REST endpoints exposed by the client layer */
export function AtfxExplorer() {
  const index = useAtfxIndex()
  const org = useAtfxOrg()
  const picklists = useAtfxPicklists('Lead')

  return (
    <>
      <Header>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>API explorer</h1>
            <OrgStatus />
          </div>
          <RefreshButton />
        </div>
        <AtfxConfigAlert />

        <div className='grid gap-4 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>GET /api</CardTitle>
              <CardDescription>Live endpoint catalog</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              {index.isLoading && <p className='text-sm text-muted-foreground'>Loading…</p>}
              {index.data?.data.endpoints.map((ep) => (
                <div key={`${ep.method}-${ep.path}`} className='flex items-center gap-2 text-sm'>
                  <Badge variant='outline'>{ep.method}</Badge>
                  <code>{ep.path}</code>
                  {ep.kind && <Badge variant='secondary'>{ep.kind}</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GET /api/org</CardTitle>
              <CardDescription>
                Cached: {String(org.data?.meta?.cached ?? false)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className='max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs'>
                {JSON.stringify(org.data?.data, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle>GET /api/picklists/Lead</CardTitle>
              <CardDescription>
                {picklists.data?.data.fieldCount} picklist fields · cached:{' '}
                {String(picklists.data?.meta?.cached ?? picklists.data?.data.cached)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='mb-2 text-sm text-muted-foreground'>
                All hooks live in <code>src/lib/atfx-api/hooks.ts</code> — org, schema,
                describe, picklists, aggregate, search, record, query, dashboard shortcuts.
              </p>
              <pre className='max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs'>
                {JSON.stringify(
                  picklists.data?.data.fields?.slice(0, 5).map((f) => ({
                    name: f.name,
                    values: f.picklistValues?.length,
                  })),
                  null,
                  2
                )}
              </pre>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}