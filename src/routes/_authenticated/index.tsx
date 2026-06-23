import { createFileRoute } from '@tanstack/react-router'
import { pageTitle } from '@/config/site'
import { Dashboard } from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  head: () => ({ meta: [{ title: pageTitle('Dashboard') }] }),
  component: Dashboard,
})
