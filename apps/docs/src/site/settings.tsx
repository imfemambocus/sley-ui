import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export const DENSITIES = ['comfortable', 'compact', 'dense'] as const
export type Density = (typeof DENSITIES)[number]

export const THEMES = ['dark', 'light'] as const
export type Theme = (typeof THEMES)[number]

export const DENSITY_TOKENS = ['--row-h', '--cell-x', '--ui-text', '--ctl-h', '--stack', '--reed-pitch'] as const

interface Settings {
  readonly density: Density
  readonly theme: Theme
  readonly setDensity: (next: Density) => void
  readonly setTheme: (next: Theme) => void
}

const SettingsContext = createContext<Settings>({
  density: 'comfortable',
  theme: 'dark',
  setDensity: () => {},
  setTheme: () => {},
})

export const useSettings = () => useContext(SettingsContext)

export const SettingsProvider = ({ children }: { readonly children: ReactNode }) => {
  const [density, setDensity] = useState<Density>('comfortable')
  const [theme, setTheme] = useState<Theme>('dark')
  const fading = useRef(0)

  useEffect(() => {
    document.documentElement.dataset.density = density
    document.documentElement.dataset.theme = theme
  }, [density, theme])

  /*
   * the flag arms the colour transition, and chrome starts no transition when the
   * flag and the new palette land in one style computation. so the palette waits a
   * frame, by which time the flag is painted. the flag lifts one instant after the
   * fade ends. under reduced motion every duration is 0ms and the theme just swaps.
   */
  const changeTheme = useCallback((next: Theme) => {
    const root = document.documentElement
    const style = getComputedStyle(root)
    const fade = Number.parseFloat(style.getPropertyValue('--dur-overlay'))
    if (fade === 0) {
      setTheme(next)
      return
    }
    const margin = Number.parseFloat(style.getPropertyValue('--dur-instant'))
    root.dataset.theming = ''
    window.clearTimeout(fading.current)
    requestAnimationFrame(() => setTheme(next))
    fading.current = window.setTimeout(() => delete root.dataset.theming, fade + margin)
  }, [])

  const value = useMemo(
    () => ({ density, theme, setDensity, setTheme: changeTheme }),
    [density, theme, changeTheme],
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
