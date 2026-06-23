import { createFileRoute } from '@tanstack/react-router'
import { AtfxExplorer } from '@/features/atfx-explorer'

export const Route = createFileRoute('/_authenticated/atfx/explore')({
  component: AtfxExplorer,
})