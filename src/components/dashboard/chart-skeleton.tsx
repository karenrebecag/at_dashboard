import { Skeleton } from '@/components/ui/skeleton'

export function ChartSkeleton({ height = 320 }: { height?: number }) {
  return (
    <div className='flex flex-col gap-3' style={{ height }}>
      <div className='flex justify-end gap-2'>
        <Skeleton className='h-3 w-16' />
        <Skeleton className='h-3 w-24' />
      </div>
      <div className='flex flex-1 items-end gap-2 px-2'>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className='flex-1 rounded-t-md'
            style={{ height: `${30 + (i % 4) * 15}%` }}
          />
        ))}
      </div>
    </div>
  )
}