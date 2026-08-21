import { useEffect } from 'react'

const SITE = 'https://sley-ui.dev'
const NAME = 'Sley UI'

export const DEFAULT_TITLE = 'Sley UI, React and Vue components for data-dense interfaces'
export const DEFAULT_DESCRIPTION =
  'A React and Vue component registry for interfaces that hold a lot of data. One density knob retunes every component.'

/* one sentence for each page that is not a component, because a crawler shows this text, not the prose */
export const PAGE_META: Record<string, { readonly title: string; readonly description: string }> = {
  '/notes/row-window': {
    title: 'Where a row window starts to pay',
    description:
      'Measured on a real table: a row window makes scrolling free at 1000 and 5000 rows, and does nothing at all for the load.',
  },
  '/notes/alignment': {
    title: 'Aligning a control to a line of type',
    description:
      'Measured: two type faces on one row drift half a pixel, a control sits 1.5px low on the box centre, and the fix is one token.',
  },
  '/notes/theme-fade': {
    title: 'A theme fade that animates five things',
    description:
      'A view transition fades the whole page with five animations. Transitioning the colours on every element starts 3164 and misses nine frames in sixty.',
  },
  '/notes/row-cursor': {
    title: 'One tab stop for five thousand rows',
    description:
      'A roving tabIndex on the row, no role of grid, and a focus band drawn on the cells so it reaches the pinned ones. Every part measured.',
  },
  '/notes/downsampling': {
    title: 'Largest triangle three buckets, and the peak it loses',
    description:
      'Of 1801 targets over 50,400 readings, 1715 keep the peak and 86 lose it. The path data goes from 733,477 characters to 14,632.',
  },
  '/docs/installation': {
    title: 'Installation',
    description: 'Add Sley UI to a Vite or Next project. The CLI writes the source into your repo and you own it.',
  },
  '/docs/vue': {
    title: 'Vue',
    description:
      'The same components in Vue: one token file, one version number, and four rules that carry every prop across.',
  },
  '/docs/updates': {
    title: 'Updates',
    description:
      'How sley update merges a new release into files you have edited, across the old version, the new one and yours.',
  },
  '/docs/releases': {
    title: 'Releases',
    description:
      'Every version the registry serves, the files each one moved, and why. Built from the frozen release bundles.',
  },
  '/docs/keyboard': {
    title: 'Keyboard',
    description:
      'Every control in a dense table reachable without a pointer: sorting, resizing, selection and the command palette.',
  },
  '/docs/density': {
    title: 'Density',
    description:
      'One attribute on the root element moves every component between comfortable, compact and dense. Six values carry it.',
  },
  '/docs/motion': {
    title: 'Motion',
    description: 'Durations named for what moves, and one easing curve taken from the beat of a loom.',
  },
  '/docs/colour': {
    title: 'Colour',
    description: 'A warm ecru weft on a cool indigo warp, with three natural dyes for status.',
  },
  '/docs/type': {
    title: 'Type',
    description: 'Archivo for the interface and IBM Plex Mono for the data, because the numbers are the content.',
  },
}

function setTag(selector: string, attribute: string, value: string) {
  const tag = document.head.querySelector(selector)
  if (tag) tag.setAttribute(attribute, value)
}

/*
 * a single page app keeps one <head> for every route, so a shared link and a crawler both
 * see the first page unless the route writes its own.
 */
export function usePageMeta(path: string, title: string, description: string) {
  useEffect(() => {
    const full = path === '/' ? DEFAULT_TITLE : `${title}, ${NAME}`
    const url = `${SITE}${path}`

    document.title = full
    setTag('meta[name="description"]', 'content', description)
    setTag('link[rel="canonical"]', 'href', url)
    setTag('meta[property="og:title"]', 'content', full)
    setTag('meta[property="og:description"]', 'content', description)
    setTag('meta[property="og:url"]', 'content', url)
    setTag('meta[name="twitter:title"]', 'content', full)
    setTag('meta[name="twitter:description"]', 'content', description)
  }, [path, title, description])
}
