import { COMPONENT_DOCS } from './components'

export interface NavItem {
  readonly href: string
  readonly label: string
}

export interface NavGroup {
  readonly label: string
  readonly items: readonly NavItem[]
}

export const NAV: readonly NavGroup[] = [
  {
    label: 'Start',
    items: [
      { href: '/', label: 'Overview' },
      { href: '/docs/installation', label: 'Installation' },
      { href: '/docs/updates', label: 'Updates' },
    ],
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
    items: COMPONENT_DOCS.map((doc) => ({ href: `/components/${doc.slug}`, label: doc.name })),
  },
]

const FLAT: readonly NavItem[] = NAV.flatMap((group) => group.items)

export function neighbours(path: string) {
  const index = FLAT.findIndex((item) => item.href === path)
  if (index === -1) return { previous: undefined, next: undefined }
  return { previous: FLAT[index - 1], next: FLAT[index + 1] }
}
