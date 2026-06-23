import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ACCOUNTS_BDM_FETCH_LIMIT } from '@/features/atfx/constants'
import { formatters } from '@/lib/planner/formatters'
import { useAccountsByBdm } from '@/lib/atfx-api'

export function AccountsByBdmTable({
  displayLimit = 15,
}: {
  displayLimit?: number
}) {
  const { data, isLoading, isError } = useAccountsByBdm(ACCOUNTS_BDM_FETCH_LIMIT)

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className='h-9 w-full' />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className='text-sm text-muted-foreground'>
        Could not load accounts by BDM
      </p>
    )
  }

  const rows = (data?.data?.records ?? []).slice(0, displayLimit)
  const total = rows.reduce((acc, r) => acc + (Number(r.cnt) || 0), 0)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-10'>#</TableHead>
          <TableHead>BDM</TableHead>
          <TableHead className='text-end'>Accounts</TableHead>
          <TableHead className='text-end'>Share</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => {
          const name = String(row.Name ?? 'Unknown')
          const cnt = Number(row.cnt) || 0
          const share = total > 0 ? cnt / total : 0
          return (
            <TableRow key={`${name}-${i}`}>
              <TableCell className='text-muted-foreground'>{i + 1}</TableCell>
              <TableCell className='font-medium'>{name}</TableCell>
              <TableCell className='text-end tabular-nums'>
                {formatters.unit(cnt)}
              </TableCell>
              <TableCell className='text-end tabular-nums text-muted-foreground'>
                {formatters.percentage({ number: share, decimals: 1 })}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
