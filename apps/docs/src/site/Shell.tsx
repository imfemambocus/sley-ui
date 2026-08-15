import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CommandPalette, type Command } from '@/components/ui/command-palette/CommandPalette'
import { Panel } from '@/components/ui/panel/Panel'
import { Toaster } from '@/components/ui/toast/Toast'
import { toaster } from '@demo/toaster'
import { NAV, neighbours } from '../content/nav'
import { GITHUB, Header } from './Header'
import { Link, useRoute } from './router'
import { Sidebar } from './Sidebar'
import { DENSITIES, THEMES, useSettings } from './settings'

const Footer = () => (
  <footer className="mt-24 border-t border-reed">
    <div className="mx-auto flex max-w-360 flex-wrap items-center justify-between gap-4 px-4 py-8 text-weft-dim sm:px-6">
      <p>
        Built by Isfaaq M. F. Emambocus. MIT licensed, and yours to change once it is in your
        project.
      </p>
      <a href={GITHUB} className="transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft">
        Source on GitHub
      </a>
    </div>
  </footer>
)

const Pager = () => {
  const { path } = useRoute()
  const { previous, next } = neighbours(path)
  if (!previous && !next) return null

  return (
    <nav aria-label="Pages" className="mt-16 flex items-stretch justify-between gap-4 border-t border-reed pt-6">
      {previous ? (
        <Link href={previous.href} className="group flex flex-col gap-1">
          <span className="font-data text-[11px] tracking-[0.13em] text-weft-faint uppercase">Back</span>
          <span className="text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) group-hover:text-weft">
            {previous.label}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={next.href} className="group flex flex-col gap-1 text-right">
          <span className="font-data text-[11px] tracking-[0.13em] text-weft-faint uppercase">Next</span>
          <span className="text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) group-hover:text-weft">
            {next.label}
          </span>
        </Link>
      )}
    </nav>
  )
}

interface ShellProps {
  readonly children: ReactNode
  /* the overview runs the full width; every documentation page keeps the sidebar */
  readonly wide?: boolean
}

export const Shell = ({ children, wide = false }: ShellProps) => {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const { setDensity, setTheme } = useSettings()
  const { go } = useRoute()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k') return
      if (!event.metaKey && !event.ctrlKey) return
      event.preventDefault()
      setPaletteOpen((open) => !open)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const commands: readonly Command[] = useMemo(
    () => [
      ...NAV.flatMap((group) =>
        group.items.map((item) => ({
          id: `go-${item.href}`,
          group: group.label,
          label: item.label,
          run: () => go(item.href),
        })),
      ),
      ...DENSITIES.map((option) => ({
        id: `density-${option}`,
        group: 'Density',
        label: `Set density to ${option}`,
        run: () => setDensity(option),
      })),
      ...THEMES.map((option) => ({
        id: `theme-${option}`,
        group: 'Appearance',
        label: `Switch to ${option}`,
        run: () => setTheme(option),
      })),
    ],
    [go, setDensity, setTheme],
  )

  return (
    <div className="min-h-dvh">
      <Header onOpenPalette={() => setPaletteOpen(true)} onOpenNav={() => setNavOpen(true)} />

      {wide ? (
        <main>{children}</main>
      ) : (
        <div className="mx-auto flex max-w-360 gap-12 px-4 sm:px-6">
          <div className="hidden w-56 shrink-0 lg:block">
            <Sidebar className="sticky top-15 max-h-[calc(100dvh-3.75rem)] overflow-y-auto py-10 pr-2" />
          </div>
          <main className="min-w-0 flex-1 py-12">
            {children}
            <Pager />
          </main>
        </div>
      )}

      <Footer />

      <Panel
        open={navOpen}
        onOpenChange={setNavOpen}
        side="start"
        title="Sley UI"
        description="Documentation"
      >
        <Sidebar className="p-4" onNavigate={() => setNavOpen(false)} />
      </Panel>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        commands={commands}
        placeholder="Go to a page, or retune the site"
      />
      <Toaster toaster={toaster} />
    </div>
  )
}
