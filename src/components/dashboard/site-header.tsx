import { AtfxMark } from '@/assets/atfx-mark'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { siteConfig } from '@/config/site'
import { OrgStatus } from '@/features/atfx/components/org-status'

type SiteHeaderProps = {
  section?: string
  actions?: React.ReactNode
}

export function SiteHeader({ section, actions }: SiteHeaderProps) {
  return (
    <div className='flex flex-wrap items-end justify-between gap-4'>
      <div className='space-y-1.5'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <span className='flex items-center gap-1.5 text-muted-foreground'>
                <AtfxMark className='size-4 shrink-0' />
                {siteConfig.shortName}
              </span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{section ?? 'Dashboard'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className='text-[1.75rem] leading-tight font-semibold'>
          {siteConfig.name}
        </h1>
        <p className='text-sm text-muted-foreground'>{siteConfig.tagline}</p>
        <OrgStatus />
      </div>
      {actions ? <div className='flex shrink-0 items-center gap-2'>{actions}</div> : null}
    </div>
  )
}