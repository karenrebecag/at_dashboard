import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { ChartEmptyState } from '@/components/dashboard/chart-empty-state'
import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { useAtfxDescribe } from '@/lib/atfx-api'

const OBJECTS = ['Account', 'Lead', 'Contact'] as const

export function SchemaExplorer() {
  const [object, setObject] = useState<string>('Account')
  const [copied, setCopied] = useState(false)
  const { data, isLoading, isError } = useAtfxDescribe(object)

  const result = data?.data
  const fields = result?.fields ?? []

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (insecure context / denied) — fail silently
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <Select value={object} onValueChange={setObject}>
          <SelectTrigger
            size='sm'
            className='w-[150px] border-0 bg-muted shadow-none dark:bg-muted'
          >
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
        {result ? (
          <span className='font-mono text-xs text-muted-foreground'>
            {result.fieldCount} fields · {result.mode}
          </span>
        ) : null}

        <Button
          variant='outline'
          size='sm'
          className='ms-auto'
          onClick={handleCopy}
          disabled={!result}
        >
          {copied ? <Check className='size-4' /> : <Copy className='size-4' />}
          {copied ? 'Copied' : 'Copy schema'}
        </Button>
      </div>

      {isLoading ? (
        <ChartSkeleton height={320} />
      ) : isError ? (
        <ChartEmptyState message={`Could not describe ${object}`} height={320} />
      ) : (
        <div className='max-h-[440px] overflow-auto rounded-lg bg-muted/30'>
          <Table>
            <TableHeader className='sticky top-0 bg-card/95 backdrop-blur'>
              <TableRow>
                <TableHead>API name</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className='text-end'>Picklist</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((f) => {
                const options = f.picklistValues ?? []
                return (
                  <TableRow key={f.name}>
                    <TableCell className='font-mono text-xs'>{f.name}</TableCell>
                    <TableCell className='text-muted-foreground'>
                      {f.label}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{f.type}</Badge>
                    </TableCell>
                    <TableCell className='text-end text-xs text-muted-foreground tabular-nums'>
                      {options.length > 0 ? (
                        <span
                          title={options
                            .slice(0, 30)
                            .map((o) => o.value)
                            .join(', ')}
                        >
                          {options.length} values
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
