import { createFileRoute } from '@tanstack/react-router'
import { LeadsAnalytics } from '@/features/leads'

export const Route = createFileRoute('/_authenticated/leads/')({
  component: LeadsAnalytics,
})