import { LayoutDashboard } from 'lucide-react'
import type { LinkProps } from '@tanstack/react-router'

export type NavLink = {
  title: string
  url: LinkProps['to'] | (string & {})
  icon?: React.ElementType
}

export type NavGroup = {
  title: string
  items: NavLink[]
}

export const navGroups: NavGroup[] = [
  {
    title: 'General',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: LayoutDashboard,
      },
    ],
  },
]