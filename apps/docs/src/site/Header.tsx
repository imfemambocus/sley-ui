import { Button } from '@/components/ui/button/Button'
import { DENSITIES, THEMES, useSettings } from './settings'
import { Link, useRoute } from './router'
import { Segmented } from './Segmented'
import { Wordmark } from './Wordmark'
import { cx } from '@/lib/cx'

const LINKS = [
  { href: '/docs/installation', label: 'Docs', match: '/docs/' },
  { href: '/components/table', label: 'Components', match: '/components/' },
]

export const GITHUB = 'https://github.com/imfemambocus/sley-ui'
/* without the file it opens on the readme, and the reader wants the code that drives the table */
export const SANDBOX =
  'https://stackblitz.com/github/imfemambocus/sley-ui/tree/main/examples/starter?file=src%2FApp.tsx'
export const SANDBOX_BLANK =
  'https://stackblitz.com/github/imfemambocus/sley-ui/tree/main/examples/blank?file=src%2FApp.tsx'

interface HeaderProps {
  readonly onOpenPalette: () => void
  readonly onOpenNav: () => void
}

export const Header = ({ onOpenPalette, onOpenNav }: HeaderProps) => {
  const { density, setDensity, theme, setTheme } = useSettings()
  const { path } = useRoute()

  return (
    <header className="reed-edge sticky top-0 z-(--z-sticky) bg-ground/85 backdrop-blur-md">
      <div className="mx-auto flex h-15 max-w-360 items-center gap-5 px-4 sm:px-6">
        {/* the 19px lockup sits 1.5px low against the 14px nav baseline when its box is centred */}
        <Link href="/" aria-label="Sley UI, home" className="flex items-center -translate-y-[1.5px]">
          <Wordmark />
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-4 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cx(
                'transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft',
                path.startsWith(link.match) ? 'text-weft' : 'text-weft-dim',
              )}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={GITHUB}
            className="text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft"
          >
            GitHub
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button onClick={onOpenPalette} className="hidden sm:inline-flex">
            <span>Search</span>
            <kbd className="font-data text-[11px] text-weft-faint">⌘K</kbd>
          </Button>
          <Segmented
            legend="Density"
            options={DENSITIES}
            value={density}
            onSelect={setDensity}
            className="hidden lg:flex"
          />
          <Segmented legend="Appearance" options={THEMES} value={theme} onSelect={setTheme} />
          <Button onClick={onOpenNav} className="lg:hidden">
            Menu
          </Button>
        </div>
      </div>
    </header>
  )
}
