import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'

export const DENSITIES = ['comfortable', 'compact', 'dense'] as const
export type Density = (typeof DENSITIES)[number]

export const THEMES = ['dark', 'light'] as const
export type Theme = (typeof THEMES)[number]

export const FRAMEWORKS = ['react', 'vue'] as const
export type Framework = (typeof FRAMEWORKS)[number]

export const DENSITY_TOKENS = ['--row-h', '--cell-x', '--ui-text', '--ctl-h', '--stack', '--reed-pitch'] as const

interface Settings {
  readonly density: Density
  readonly theme: Theme
  /* every code block on the site reads this one */
  readonly framework: Framework
  readonly setDensity: (next: Density) => void
  readonly setTheme: (next: Theme) => void
  readonly setFramework: (next: Framework) => void
}

const SettingsContext = createContext<Settings>({
  density: 'comfortable',
  theme: 'dark',
  framework: 'react',
  setDensity: () => {},
  setTheme: () => {},
  setFramework: () => {},
})

export const useSettings = () => useContext(SettingsContext)

export const SettingsProvider = ({ children }: { readonly children: ReactNode }) => {
  const [density, setDensity] = useState<Density>('comfortable')
  const [theme, setTheme] = useState<Theme>('dark')
  const [framework, setFramework] = useState<Framework>('react')

  useEffect(() => {
    document.documentElement.dataset.density = density
    document.documentElement.dataset.theme = theme
  }, [density, theme])

  /*
   * the cross fade needs the new palette inside its callback, so the state update
   * is flushed there. reduced motion sets the duration to 0ms and takes the plain
   * path, which spares the snapshot. a browser with no view transitions swaps.
   */
  const changeTheme = useCallback((next: Theme) => {
    const fade = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--dur-overlay'),
    )
    if (fade === 0 || !document.startViewTransition) {
      setTheme(next)
      return
    }
    document.startViewTransition(() => {
      flushSync(() => setTheme(next))
    })
  }, [])

  const value = useMemo(
    () => ({ density, theme, framework, setDensity, setTheme: changeTheme, setFramework }),
    [density, theme, framework, changeTheme],
  )
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

/* the six values behind the current mode, read back off the root element */
export function useDensityValues(density: Density) {
  const [values, setValues] = useState<readonly { name: string; value: string }[]>([])

  useEffect(() => {
    const style = getComputedStyle(document.documentElement)
    setValues(
      DENSITY_TOKENS.map((token) => ({ name: token.slice(2), value: style.getPropertyValue(token).trim() })),
    )
  }, [density])

  return values
}
