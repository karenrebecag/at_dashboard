import type * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// OSMO eyebrow/tag — Haffer Mono, uppercase, tight. Use for section labels,
// category markers and small status tags.
const chipVariants = cva(
  'inline-flex w-fit items-center gap-1.5 rounded-md font-mono text-[0.6875rem] leading-none tracking-[0.04em] uppercase [&>svg]:size-3',
  {
    variants: {
      variant: {
        solid: 'bg-primary text-primary-foreground px-2 py-1',
        tint: 'bg-muted text-foreground/70 px-2 py-1',
        outline: 'border border-border/60 text-foreground/70 px-2 py-1',
        ghost: 'text-foreground/45 px-0.5',
      },
    },
    defaultVariants: {
      variant: 'tint',
    },
  },
)

export function Chip({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof chipVariants>) {
  return (
    <span
      data-slot='chip'
      className={cn(chipVariants({ variant }), className)}
      {...props}
    />
  )
}
