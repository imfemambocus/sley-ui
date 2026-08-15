import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'

interface Route {
  readonly path: string
  readonly go: (href: string) => void
}

const RouteContext = createContext<Route>({ path: '/', go: () => {} })

export const useRoute = () => useContext(RouteContext)

/*
 * a plain click with no modifier is the only one this takes. a middle click, a
 * cmd click and a target both belong to the browser.
 */
function isPlainClick(event: MouseEvent<HTMLAnchorElement>) {
  if (event.defaultPrevented || event.button !== 0) return false
  return !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

export const Router = ({ children }: { readonly children: ReactNode }) => {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const go = useCallback((href: string) => {
    const [target, hash] = href.split('#')
    if (target !== window.location.pathname) {
      window.history.pushState(null, '', href)
      setPath(target)
    }
    if (hash === undefined) {
      window.scrollTo({ top: 0 })
      return
    }
    /* the section has to be in the document before it can be scrolled to */
    requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView())
  }, [])

  const value = useMemo(() => ({ path, go }), [path, go])
  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>
}

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly href: string
}

export const Link = ({ href, onClick, children, ...props }: LinkProps) => {
  const { go } = useRoute()

  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event)
        if (!href.startsWith('/') || !isPlainClick(event)) return
        event.preventDefault()
        go(href)
      }}
      {...props}
    >
      {children}
    </a>
  )
}
