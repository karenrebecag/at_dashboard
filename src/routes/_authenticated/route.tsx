import { createFileRoute } from '@tanstack/react-router'
import { RedirectToSignIn, useAuth, useClerk, useUser } from '@clerk/react'
import { ShieldX } from 'lucide-react'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { Button } from '@/components/ui/button'
import { isAllowedEmail } from '@/config/access'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { isLoaded: userLoaded, user } = useUser()

  // Wait for Clerk before deciding, to avoid a flash on reload
  if (!authLoaded || !userLoaded) return null
  if (!isSignedIn) return <RedirectToSignIn />

  const email = user?.primaryEmailAddress?.emailAddress
  if (!isAllowedEmail(email)) return <AccessDenied email={email} />

  return <AuthenticatedLayout />
}

function AccessDenied({ email }: { email?: string }) {
  const { signOut } = useClerk()

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-5 p-6 text-center'>
      <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
        <ShieldX className='size-6 text-muted-foreground' />
      </div>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Access restricted
        </h1>
        <p className='max-w-md text-sm text-muted-foreground'>
          {email ? (
            <>
              The account{' '}
              <span className='font-medium text-foreground'>{email}</span> is not
              authorized for this dashboard.
            </>
          ) : (
            'This account is not authorized for this dashboard.'
          )}{' '}
          Ask an administrator to grant access.
        </p>
      </div>
      <Button variant='outline' onClick={() => signOut()}>
        Sign out
      </Button>
    </div>
  )
}
