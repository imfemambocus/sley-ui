import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

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

  useEffect(() => {
    document.documentElement.dataset.density = density
    document.documentElement.dataset.theme = theme
  }, [density, theme])

  const value = useMemo(() => ({ density, theme, setDensity, setTheme }), [density, theme])
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
