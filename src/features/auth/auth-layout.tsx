import { Logo } from '@/assets/logo'
import { siteConfig } from '@/config/site'

const LOGIN_VIDEO_URL =
  'https://pub-62c41549a44642efbcd3f775bdb039b3.r2.dev/stock-market-exchange-and-forex-candles-chart-back-2026-01-28-03-22-46-utc.mp4'

type AuthLayoutProps = {
  children: React.ReactNode
}

// login-01 style — two columns: auth on the left, brand panel on the right.
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-8 p-6 md:p-10'>
        <div className='flex items-center gap-2 font-medium'>
          <Logo className='size-6' />
          {siteConfig.shortName}
        </div>

        <div className='flex flex-1 items-center justify-center'>
          <div className='flex w-full max-w-sm flex-col items-center gap-6'>
            <div className='space-y-1.5 text-center'>
              <h1 className='text-2xl font-semibold tracking-tight'>
                {siteConfig.name}
              </h1>
              <p className='text-sm text-muted-foreground'>
                {siteConfig.tagline}
              </p>
            </div>
            {children}
          </div>
        </div>

        <p className='text-center text-xs text-muted-foreground'>
          Internal tool · {siteConfig.shortName} · secured by Clerk
        </p>
      </div>

      <div className='relative hidden overflow-hidden lg:block'>
        <video
          className='absolute inset-0 size-full object-cover'
          src={LOGIN_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden='true'
        />
        {/* Sea-tinted overlay keeps the white brand readable over the footage */}
        <div
          className='absolute inset-0'
          style={{
            background:
              'linear-gradient(140deg, color-mix(in oklch, var(--sea-50) 82%, transparent), color-mix(in oklch, var(--sea-300) 36%, transparent))',
          }}
        />
        <div className='relative flex h-full flex-col items-center justify-center gap-6 p-12 text-center'>
          <p className='max-w-sm text-lg leading-snug font-medium text-white/90'>
            {siteConfig.tagline}
          </p>
        </div>
      </div>
    </div>
  )
}
