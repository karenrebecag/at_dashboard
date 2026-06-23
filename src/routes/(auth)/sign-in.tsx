import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/react'
import { AuthLayout } from '@/features/auth/auth-layout'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  return (
    <AuthLayout>
      <div className='flex justify-center'>
        <SignIn signUpUrl='/sign-up' />
      </div>
    </AuthLayout>
  )
}
