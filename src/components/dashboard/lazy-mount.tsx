import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ChartSkeleton } from '@/components/dashboard/chart-skeleton'
import { cn } from '@/lib/utils'

type LazyMountProps = {
  children: ReactNode
  height?: number
  className?: string
}

export function LazyMount({
  children,
  height = 320,
  className,
}: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      // Head start: mount ~one screen before the widget scrolls into view so
      // its render is ready on arrival. The query is already warmed by
      // useDashboardPrefetch, so this only gates the (heavier) chart render.
      { rootMargin: '300px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Once the chart mounts, cross-fade the skeleton out on the next frame
  useLayoutEffect(() => {
    if (!visible) return
    const id = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(id)
  }, [visible])

  return (
    <div
      ref={ref}
      className={cn('t-skel', revealed && 'is-revealed', className)}
      style={{ minHeight: height }}
    >
      {visible && <div className='t-skel-content'>{children}</div>}
      <div className='t-skel-skeleton'>
        <ChartSkeleton height={height} />
      </div>
    </div>
  )
}
