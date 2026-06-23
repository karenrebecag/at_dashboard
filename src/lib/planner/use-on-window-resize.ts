import { useEffect } from 'react'

// Adapted from template-planner (Tremor useOnWindowResize)
export function useOnWindowResize(handler: () => void) {
  useEffect(() => {
    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [handler])
}