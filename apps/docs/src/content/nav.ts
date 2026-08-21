import { COMPONENT_DOCS } from './components'
import { NOTES } from './notes'

export interface NavItem {
  readonly href: string
  readonly label: string
}

export interface NavGroup {
  readonly label: string
  readonly items: readonly NavItem[]
}

/* a chart is its own layer, and it is not one of the twelve controls */
const CHART_SLUGS: ReadonlySet<string> = new Set(['chart'])

const linkOf = (doc: (typeof COMPONENT_DOCS)[number]) => ({ href: `/components/${doc.slug}`, label: doc.name })

export const NAV: readonly NavGroup[] = [
  {
    label: 'Start',
    items: [
      { href: '/', label: 'Overview' },
      { href: '/docs/installation', label: 'Installation' },
      { href: '/docs/vue', label: 'Vue' },
      { href: '/docs/updates', label: 'Updates' },
      { href: '/docs/releases', label: 'Releases' },
      { href: '/docs/keyboard', label: 'Keyboard' },
    ],
  },
  {
    label: 'Notes',
    items: NOTES.map((note) => ({ href: `/notes/${note.slug}`, label: note.label })),
  },
  {
    label: 'Design language',
    items: [
      { href: '/docs/density', label: 'Density' },
      { href: '/docs/motion', label: 'Motion' },
      { href: '/docs/colour', label: 'Colour' },
      { href: '/docs/type', label: 'Type' },
    ],
  },
  {
    label: 'Components',
    items: COMPONENT_DOCS.filter((doc) => !CHART_SLUGS.has(doc.slug)).map(linkOf),
  },
  {
    label: 'Charts',
    items: COMPONENT_DOCS.filter((doc) => CHART_SLUGS.has(doc.slug)).map(linkOf),
  },
]

const FLAT: readonly NavItem[] = NAV.flatMap((group) => group.items)

export function neighbours(path: string) {
  const index = FLAT.findIndex((item) => item.href === path)
  if (index === -1) return { previous: undefined, next: undefined }
  return { previous: FLAT[index - 1], next: FLAT[index + 1] }
}
