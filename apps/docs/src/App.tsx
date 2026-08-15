import type { FC } from 'react'
import { findComponentDoc } from './content/components'
import { ColourPage } from './pages/Colour'
import { ComponentPage } from './pages/ComponentPage'
import { DensityPage } from './pages/Density'
import { Home } from './pages/Home'
import { Installation } from './pages/Installation'
import { MotionPage } from './pages/Motion'
import { NotFound } from './pages/NotFound'
import { TypePage } from './pages/Type'
import { Updates } from './pages/Updates'
import { Shell } from './site/Shell'
import { useRoute } from './site/router'

const DOC_PAGES: Record<string, FC> = {
  '/docs/installation': Installation,
  '/docs/updates': Updates,
  '/docs/density': DensityPage,
  '/docs/motion': MotionPage,
  '/docs/colour': ColourPage,
  '/docs/type': TypePage,
}

const COMPONENT_PREFIX = '/components/'

export const App = () => {
  const { path } = useRoute()

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
