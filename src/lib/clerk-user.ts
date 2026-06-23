import type { useUser } from '@clerk/react'

type ClerkUser = ReturnType<typeof useUser>['user']

interface ClerkUserDisplay {
  name: string
  email: string
  avatar: string
  initials: string
}

// Maps a Clerk user into the shape the template's user widgets expect
export function getClerkUserDisplay(user: ClerkUser): ClerkUserDisplay {
  const name = user?.fullName ?? user?.username ?? 'User'
  const email = user?.primaryEmailAddress?.emailAddress ?? ''
  const avatar = user?.imageUrl ?? ''
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || name.slice(0, 2).toUpperCase()

  return { name, email, avatar, initials }
}
