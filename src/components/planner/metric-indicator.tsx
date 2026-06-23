import { cn } from '@/lib/utils'

type Category = 'red' | 'orange' | 'emerald' | 'gray'

const getCategory = (value: number): Category => {
  if (value < 0.3) return 'red'
  if (value < 0.7) return 'orange'
  return 'emerald'
}

const categoryConfig = {
  red: {
    activeClass: 'bg-red-500 dark:bg-red-500',
    bars: 1,
  },
  orange: {
    activeClass: 'bg-orange-500 dark:bg-orange-500',
    bars: 2,
  },
  emerald: {
    activeClass: 'bg-emerald-500 dark:bg-emerald-500',
    bars: 3,
  },
  gray: {
    activeClass: 'bg-muted',
    bars: 0,
  },
} as const

/** Three-bar health indicator from template-planner MetricsCards */
export function MetricIndicator({ value }: { value: number }) {
  const category = Number.isFinite(value) ? getCategory(value) : 'gray'
  const config = categoryConfig[category]
  const inactiveClass = 'bg-muted'

  return (
    <div className='flex gap-0.5' aria-hidden>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            'h-3.5 w-1 rounded-sm',
            index < config.bars ? config.activeClass : inactiveClass,
          )}
        />
      ))}
    </div>
  )
}

export type PlannerMetric = {
  label: string
  /** 0–1 score driving the indicator bars */
  score: number
  headline: string
  detail?: string
}

export function PlannerMetricCard({ metric }: { metric: PlannerMetric }) {
  return (
    <div>
      <dt className='text-sm text-muted-foreground'>{metric.label}</dt>
      <dd className='mt-1.5 flex items-center gap-2'>
        <MetricIndicator value={metric.score} />
        <p className='text-lg font-semibold'>
          {metric.headline}
          {metric.detail && (
            <span className='font-medium text-muted-foreground'>
              {' '}
              — {metric.detail}
            </span>
          )}
        </p>
      </dd>
    </div>
  )
}