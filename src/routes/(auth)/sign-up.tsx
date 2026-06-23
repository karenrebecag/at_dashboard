import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@clerk/react'
import { AuthLayout } from '@/features/auth/auth-layout'

export const Route = createFileRoute('/(auth)/sign-up')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthLayout>
      <div className='flex justify-center'>
        <SignUp signInUrl='/sign-in' />
      </div>
    </AuthLayout>
  )
}
