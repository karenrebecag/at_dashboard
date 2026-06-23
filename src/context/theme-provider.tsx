import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { getCookie, setCookie } from '@/lib/cookies'

type Theme = 'dark' | 'light'
type StoredTheme = Theme | 'system'

const THEME_COOKIE_NAME = 'vite-ui-theme'
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: StoredTheme
  storageKey?: string
}

type ThemeProviderState = {
  resolvedTheme: Theme
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  resolvedTheme: 'light',
  theme: 'light',
  setTheme: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

function resolveStoredTheme(stored: StoredTheme | undefined): Theme {
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = THEME_COOKIE_NAME,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = getCookie(storageKey) as StoredTheme | undefined
    if (stored === 'dark' || stored === 'light') return stored
    if (typeof window === 'undefined') return 'light'
    return resolveStoredTheme(stored ?? defaultTheme)
  })

  const resolvedTheme = useMemo(() => theme, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = (next: Theme) => {
    setCookie(storageKey, next, THEME_COOKIE_MAX_AGE)
    setThemeState(next)
  }

  return (
    <ThemeContext value={{ resolvedTheme, theme, setTheme }} {...props}>
      {children}
    </ThemeContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}