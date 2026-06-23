import { type ImgHTMLAttributes } from 'react'
import { AtfxMark } from '@/assets/atfx-mark'
import { cn } from '@/lib/utils'

type LogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>

/** Compact ATFX mark (favicon) — auth screens and inline branding */
export function Logo({ className, ...props }: LogoProps) {
  return <AtfxMark className={cn('size-8', className)} {...props} />
}