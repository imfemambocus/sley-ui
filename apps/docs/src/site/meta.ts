import { useEffect } from 'react'

const SITE = 'https://sley-ui.dev'
const NAME = 'Sley UI'

export const DEFAULT_TITLE = 'Sley UI, React components for data-dense interfaces'
export const DEFAULT_DESCRIPTION =
  'A React component registry for interfaces that hold a lot of data. One density knob retunes every component.'

/* one sentence for each page that is not a component, because a crawler shows this text, not the prose */
export const PAGE_META: Record<string, { readonly title: string; readonly description: string }> = {
  '/docs/installation': {
    title: 'Installation',
    description: 'Add Sley UI to a Vite or Next project. The CLI writes the source into your repo and you own it.',
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
