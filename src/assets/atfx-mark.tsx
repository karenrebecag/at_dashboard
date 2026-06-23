import { type ImgHTMLAttributes } from 'react'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

type AtfxMarkProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>

/** ATFX favicon — breadcrumb, auth, etc. */
export function AtfxMark({ className, ...props }: AtfxMarkProps) {
  return (
    <img
      src={siteConfig.brand.favicon}
      alt={siteConfig.shortName}
      className={cn('object-contain', className)}
      {...props}
    />
  )
}