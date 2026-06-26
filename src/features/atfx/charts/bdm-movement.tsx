import { useState } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  BDMS_DROPPED,
  BDMS_IMPROVED,
  movement,
  type BdmMovement,
} from './bdm-movement-data'

type Direction = 'up' | 'down'

const VIEWS: Record<
  Direction,
  { title: string; rows: BdmMovement[]; icon: typeof TrendingUp; accent: string }
> = {
  up: {
    title: 'BDMs Who Improved',
    rows: BDMS_IMPROVED,
    icon: TrendingUp,
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
  down: {
    title: 'BDMs Who Dropped',
    rows: BDMS_DROPPED,
    icon: TrendingDown,
    accent: 'text-rose-600 dark:text-rose-400',
  },
}

export function BdmMovementBoards() {
  const [direction, setDirection] = useState<Direction>('up')
  const view = VIEWS[direction]
  const Icon = view.icon

  return (
    <Card className='gap-4 py-5'>
      <div className='flex flex-wrap items-center justify-between gap-3 px-5'>
        <div className='flex items-center gap-2'>
          <Icon className={`size-4 shrink-0 ${view.accent}`} />
          <h3 className='text-base font-semibold'>{view.title}</h3>
          <span className='text-sm text-muted-foreground tabular-nums'>
            ({view.rows.length})
          </span>
        </div>

        <ToggleGroup
          type='single'
          variant='outline'
          size='sm'
          value={direction}
          onValueChange={(v) => v && setDirection(v as Direction)}
        >
          <ToggleGroupItem value='up'>
            Improved ({BDMS_IMPROVED.length})
          </ToggleGroupItem>
          <ToggleGroupItem value='down'>
            Dropped ({BDMS_DROPPED.length})
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {view.rows.length === 0 ? (
        <p className='px-5 py-8 text-sm text-muted-foreground'>
          No BDMs in this category
        </p>
      ) : (
        <ol className='space-y-2 px-5'>
          {view.rows.map((row, i) => (
            <MovementRow key={`${row.name}-${i}`} row={row} direction={direction} />
          ))}
        </ol>
      )}
    </Card>
  )
}

function MovementRow({
  row,
  direction,
}: {
  row: BdmMovement
  direction: Direction
}) {
  const delta = movement(row)
  const chipAccent =
    direction === 'up'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'

  return (
    <li className='flex items-center justify-between gap-3 rounded-lg border bg-background/40 px-3 py-2'>
      <div className='min-w-0'>
        <p className='truncate text-sm font-medium' title={row.name}>
          {row.name}
        </p>
        <p className='text-xs text-muted-foreground tabular-nums'>
          Prev: #{row.prevRank} · Current: #{row.currentRank} · Score:{' '}
          {row.score.toFixed(1)}
        </p>
      </div>

      <div className='flex shrink-0 items-center gap-2'>
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${chipAccent}`}
        >
          {direction === 'up' ? '↑' : '↓'}
          {Math.abs(delta)}
        </span>
        <span className='hidden text-xs text-muted-foreground sm:inline'>
          {row.recognition}
        </span>
      </div>
    </li>
  )
}
