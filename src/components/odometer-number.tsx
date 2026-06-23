import { useEffect, useRef } from 'react'
import {
  animateOdometer,
  prefersReducedMotion,
  updateOdometer,
  type OdometerOptions,
} from '@/lib/odometer/number-odometer'
import { cn } from '@/lib/utils'

type OdometerNumberProps = {
  value: string
  className?: string
  duration?: number
  start?: number
  /** Stagger delay when the element enters the viewport (seconds). */
  staggerIndex?: number
  staggerStep?: number
  /** IntersectionObserver rootMargin — default mimics “top 80%”. */
  rootMargin?: string
}

export function OdometerNumber({
  value,
  className,
  duration = 1.1,
  start = 0,
  staggerIndex = 0,
  staggerStep = 0.1,
  rootMargin = '0px 0px -20% 0px',
}: OdometerNumberProps) {
  const elRef = useRef<HTMLSpanElement>(null)
  const hasEnteredRef = useRef(false)
  const lastValueRef = useRef<string | null>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    if (prefersReducedMotion()) {
      el.textContent = value
      hasEnteredRef.current = true
      lastValueRef.current = value
      return
    }

    if (hasEnteredRef.current) {
      if (lastValueRef.current !== value) {
        updateOdometer(el, value, { duration: Math.min(duration, 0.9) })
        lastValueRef.current = value
      }
      return
    }

    el.textContent = value

    const options: OdometerOptions = {
      duration,
      start,
      delay: staggerIndex * staggerStep,
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || hasEnteredRef.current) return
        hasEnteredRef.current = true
        animateOdometer(el, value, options)
        lastValueRef.current = value
        observer.disconnect()
      },
      { threshold: 0, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration, start, staggerIndex, staggerStep, rootMargin])

  return (
    <span
      ref={elRef}
      data-odometer-element
      className={cn('odometer-number', className)}
      aria-label={value}
    />
  )
}