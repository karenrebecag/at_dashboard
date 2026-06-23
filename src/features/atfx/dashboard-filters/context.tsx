import { useNavigate } from '@tanstack/react-router'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  filterKeysMatch,
  filtersToRouterSearch,
  parseFiltersFromUrl,
} from './url'
import {
  DEFAULT_DASHBOARD_FILTERS,
  type DashboardFilters,
} from './types'

type DashboardFiltersContextValue = DashboardFilters & {
  setDays: (days: number) => void
  setPeriod: (period: string) => void
  setCountry: (country: string | undefined) => void
  patchFilters: (patch: Partial<DashboardFilters>) => void
}

const DashboardFiltersContext = createContext<DashboardFiltersContextValue | null>(
  null,
)

export function DashboardFiltersProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<DashboardFilters>(() =>
    parseFiltersFromUrl(),
  )

  const commit = useCallback((updater: (prev: DashboardFilters) => DashboardFilters) => {
    setFilters((prev) => updater(prev))
  }, [])

  // Defer URL sync — never call history/router during the setState updater (breaks Transitioner).
  useEffect(() => {
    if (filterKeysMatch(filters)) return

    navigate({
      to: '.',
      search: (prev) =>
        filtersToRouterSearch(filters, prev as Record<string, unknown>),
      replace: true,
    })
  }, [filters, navigate])

  const setDays = useCallback(
    (days: number) => commit((prev) => ({ ...prev, days })),
    [commit],
  )

  const setPeriod = useCallback(
    (period: string) => commit((prev) => ({ ...prev, period })),
    [commit],
  )

  const setCountry = useCallback(
    (country: string | undefined) =>
      commit((prev) => {
        const next = { ...prev }
        if (country) next.country = country
        else delete next.country
        return next
      }),
    [commit],
  )

  const patchFilters = useCallback(
    (patch: Partial<DashboardFilters>) =>
      commit((prev) => {
        const next = { ...prev, ...patch }
        if (!patch.country && 'country' in patch && patch.country === undefined) {
          delete next.country
        }
        return next
      }),
    [commit],
  )

  const value = useMemo<DashboardFiltersContextValue>(
    () => ({
      ...filters,
      setDays,
      setPeriod,
      setCountry,
      patchFilters,
    }),
    [filters, setDays, setPeriod, setCountry, patchFilters],
  )

  return (
    <DashboardFiltersContext.Provider value={value}>
      {children}
    </DashboardFiltersContext.Provider>
  )
}

export function useDashboardFilters(): DashboardFiltersContextValue {
  const ctx = useContext(DashboardFiltersContext)
  if (!ctx) {
    return {
      ...DEFAULT_DASHBOARD_FILTERS,
      setDays: () => {},
      setPeriod: () => {},
      setCountry: () => {},
      patchFilters: () => {},
    }
  }
  return ctx
}