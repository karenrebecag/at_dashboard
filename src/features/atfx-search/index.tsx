import { useState, type FormEvent, type ReactNode } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchIcon } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AtfxConfigAlert } from '@/features/atfx/components/atfx-config-alert'
import { CacheBadge } from '@/features/atfx/components/cache-badge'
import { OrgStatus } from '@/features/atfx/components/org-status'
import { RefreshButton } from '@/features/atfx/components/refresh-button'
import { useAtfxSearch } from '@/lib/atfx-api'
import type { SearchParams } from '@/lib/atfx-api/types'

const OBJECTS = ['Lead', 'Account', 'Contact'] as const

export function AtfxSearch() {
  const [params, setParams] = useState<SearchParams>({
    object: 'Lead',
    days: 30,
    limit: 25,
  })
  const [submitted, setSubmitted] = useState<SearchParams | null>(null)
  const query = useAtfxSearch(submitted ?? { object: '' }, Boolean(submitted))

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setSubmitted({ ...params })
  }

  return (
    <>
      <Header>
        <SearchIcon />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Search records</h1>
            <OrgStatus />
          </div>
          <RefreshButton />
        </div>

        <AtfxConfigAlert />

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Maps to GET /api/search — reactive via TanStack Query</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <Field label='Object'>
                <Select
                  value={params.object}
                  onValueChange={(v) => setParams((p) => ({ ...p, object: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OBJECTS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label='Name (LIKE)'>
                <Input
                  value={params.name ?? ''}
                  onChange={(e) => setParams((p) => ({ ...p, name: e.target.value || undefined }))}
                />
              </Field>
              <Field label='Email (LIKE)'>
                <Input
                  value={params.email ?? ''}
                  onChange={(e) => setParams((p) => ({ ...p, email: e.target.value || undefined }))}
                />
              </Field>
              <Field label='Status (Lead)'>
                <Input
                  value={params.status ?? ''}
                  onChange={(e) =>
                    setParams((p) => ({ ...p, status: e.target.value || undefined }))
                  }
                />
              </Field>
              <Field label='Country ISO-3'>
                <Input
                  value={params.country ?? ''}
                  onChange={(e) =>
                    setParams((p) => ({ ...p, country: e.target.value || undefined }))
                  }
                  placeholder='MEX'
                />
              </Field>
              <Field label='BDM / Owner.Name'>
                <Input
                  value={params.ownerName ?? ''}
                  onChange={(e) =>
                    setParams((p) => ({ ...p, ownerName: e.target.value || undefined }))
                  }
                />
              </Field>
              <Field label='Days (CreatedDate)'>
                <Input
                  type='number'
                  min={1}
                  max={365}
                  value={params.days ?? 30}
                  onChange={(e) =>
                    setParams((p) => ({ ...p, days: Number(e.target.value) || undefined }))
                  }
                />
              </Field>
              <Field label='Limit'>
                <Input
                  type='number'
                  min={1}
                  max={200}
                  value={params.limit ?? 25}
                  onChange={(e) =>
                    setParams((p) => ({ ...p, limit: Number(e.target.value) || undefined }))
                  }
                />
              </Field>
              <div className='flex items-end'>
                <Button type='submit'>Search</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {submitted && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                Results
                <CacheBadge cached={query.data?.meta?.cached as boolean | undefined} />
              </CardTitle>
              <CardDescription className='font-mono text-xs'>
                {(query.data?.meta?.soql as string) ?? ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {query.isLoading && <p className='text-muted-foreground'>Searching…</p>}
              {query.isError && (
                <p className='text-destructive'>Search failed — check API config and filters.</p>
              )}
              {query.data?.data?.records && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Id</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {query.data.data.records.map((row) => (
                      <TableRow key={String(row.Id)}>
                        <TableCell className='font-mono text-xs'>{String(row.Id ?? '')}</TableCell>
                        <TableCell>{String(row.Name ?? '')}</TableCell>
                        <TableCell>{String(row.Email ?? '')}</TableCell>
                        <TableCell>{String(row.Status ?? '')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      {children}
    </div>
  )
}