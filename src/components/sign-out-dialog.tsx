import { useNavigate } from '@tanstack/react-router'
import { useClerk } from '@clerk/react'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const { signOut } = useClerk()

  const handleSignOut = () => {
    // Clerk clears the session; redirect to the sign-in route once done
    signOut(() => navigate({ to: '/sign-in', replace: true }))
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
