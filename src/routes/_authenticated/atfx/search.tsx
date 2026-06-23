import { createFileRoute } from '@tanstack/react-router'
import { AtfxSearch } from '@/features/atfx-search'

export const Route = createFileRoute('/_authenticated/atfx/search')({
  component: AtfxSearch,
})