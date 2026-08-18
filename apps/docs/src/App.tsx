import type { FC } from 'react'
import { findComponentDoc } from './content/components'
import { ColourPage } from './pages/Colour'
import { ComponentPage } from './pages/ComponentPage'
import { DensityPage } from './pages/Density'
import { Home } from './pages/Home'
import { Installation } from './pages/Installation'
import { MotionPage } from './pages/Motion'
import { NotFound } from './pages/NotFound'
import { Releases } from './pages/Releases'
import { TypePage } from './pages/Type'
import { Updates } from './pages/Updates'
import { DEFAULT_DESCRIPTION, PAGE_META, usePageMeta } from './site/meta'
import { Shell } from './site/Shell'
import { useRoute } from './site/router'

const DOC_PAGES: Record<string, FC> = {
  '/docs/installation': Installation,
  '/docs/updates': Updates,
  '/docs/releases': Releases,
  '/docs/density': DensityPage,
  '/docs/motion': MotionPage,
  '/docs/colour': ColourPage,
  '/docs/type': TypePage,
}

const COMPONENT_PREFIX = '/components/'

function metaFor(path: string) {
  if (path === '/') return { title: 'Overview', description: DEFAULT_DESCRIPTION }
  const page = PAGE_META[path]
  if (page) return page

  const doc = path.startsWith(COMPONENT_PREFIX) ? findComponentDoc(path.slice(COMPONENT_PREFIX.length)) : undefined
  if (doc) return { title: doc.name, description: doc.summary }
  return { title: 'Not found', description: DEFAULT_DESCRIPTION }
}

export const App = () => {
  const { path } = useRoute()
  const meta = metaFor(path)
  usePageMeta(path, meta.title, meta.description)

  if (path === '/') {
    return (
      <Shell wide>
        <Home />
      </Shell>
    )
  }

  const Page = DOC_PAGES[path]
  if (Page) {
    return (
      <Shell>
        <Page />
      </Shell>
    )
  }

  if (path.startsWith(COMPONENT_PREFIX)) {
    const doc = findComponentDoc(path.slice(COMPONENT_PREFIX.length))
    if (doc) {
      return (
        <Shell>
          <ComponentPage key={doc.slug} doc={doc} />
        </Shell>
      )
    }
  }

  return (
    <Shell>
      <NotFound />
    </Shell>
  )
}
