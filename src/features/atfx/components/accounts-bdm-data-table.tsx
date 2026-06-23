import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { DataTablePagination } from '@/components/data-table/pagination'
import { ChartEmptyState } from '@/components/dashboard/chart-empty-state'
import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ACCOUNTS_BDM_FETCH_LIMIT } from '@/features/atfx/constants'
import { useAccountsByBdm, useDashboardBatchReady } from '@/lib/atfx-api'
import { formatters } from '@/lib/planner/formatters'

type BdmAccountRow = {
  rank: number
  name: string
  accounts: number
  share: number
}

export function AccountsBdmDataTable() {
  const batchReady = useDashboardBatchReady()
  const { data, isLoading, isError } = useAccountsByBdm(
    ACCOUNTS_BDM_FETCH_LIMIT,
    batchReady,
  )
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'accounts', desc: true },
  ])
  const [globalFilter, setGlobalFilter] = useState('')

  const rows = useMemo(() => {
    const records = data?.data?.records ?? []
    const total = records.reduce((acc, r) => acc + (Number(r.cnt) || 0), 0)
    return records.map((row, i) => {
      const accounts = Number(row.cnt) || 0
      return {
        rank: i + 1,
        name: String(row.Name ?? 'Unknown'),
        accounts,
        share: total > 0 ? accounts / total : 0,
      } satisfies BdmAccountRow
    })
  }, [data])

  const columns = useMemo<ColumnDef<BdmAccountRow>[]>(
    () => [
      {
        accessorKey: 'rank',
        header: '#',
        cell: ({ row }) => (
          <span className='text-muted-foreground'>{row.original.rank}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='BDM' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'accounts',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Accounts' />
        ),
        cell: ({ row }) => (
          <span className='tabular-nums'>{formatters.unit(row.original.accounts)}</span>
        ),
      },
      {
        accessorKey: 'share',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Share' />
        ),
        cell: ({ row }) => (
          <span className='tabular-nums text-muted-foreground'>
            {formatters.percentage({ number: row.original.share, decimals: 1 })}
          </span>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  if (isLoading) return <ChartSkeleton height={280} />
  if (isError) return <ChartEmptyState message='Could not load accounts by BDM' />

  return (
    <div className='space-y-4'>
      <Input
        placeholder='Search BDM…'
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className='max-w-xs'
      />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}