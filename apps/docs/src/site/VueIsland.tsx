import { useEffect, useRef, useState } from 'react'
import type { App } from 'vue'

interface VueIslandProps {
  /* the module holding the single file component to mount, loaded on demand */
  readonly load: () => Promise<{ readonly default: unknown }>
}

/*
 * the site is a react application, so a vue demo runs as its own application inside one
 * node of it. the import is dynamic, which keeps vue and its ark adapter out of the
 * bundle a reader on the react side downloads.
 */
export const VueIsland = ({ load }: VueIslandProps) => {
  const host = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let app: App | undefined
    let live = true

    const mount = async () => {
      const [{ createApp }, module] = await Promise.all([import('vue'), load()])
      if (!live || !host.current) return
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      app = createApp(module.default as Parameters<typeof createApp>[0])
      app.mount(host.current)
    }

    mount().catch(() => setFailed(true))

    return () => {
      live = false
      app?.unmount()
    }
  }, [load])

  if (failed) return <p className="text-weft-dim">The Vue demo did not load. Reload the page.</p>
  /* the frame comes from the demo itself, so this node holds the height until it arrives */
  return <div ref={host} className="min-h-40" />
}
