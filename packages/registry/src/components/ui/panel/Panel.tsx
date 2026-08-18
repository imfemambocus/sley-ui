import { Dialog } from '@ark-ui/react/dialog'
import { Portal } from '@ark-ui/react/portal'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CloseIcon } from '@/components/ui/icons/Icons'
import { cx } from '@/lib/cx'

export type PanelSide = 'start' | 'end'

/* below this the panel covers the page and has to behave as a modal */
const SHEET = '(max-width: 640px)'

function useSheet() {
  const [sheet, setSheet] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(SHEET)
    const apply = () => setSheet(query.matches)
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  return sheet
}

/*
 * zag returns focus from inside its focus trap, and it only runs that trap when the dialog is
 * modal. so a panel that leaves the page live drops the reader on the body when it closes, and
 * has to put focus back itself. closing is always started from inside the panel here, by escape
 * or by the close button, so there is no other claim on focus to weigh.
 */
function useReturnFocus(open: boolean, trapped: boolean) {
  const origin = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (trapped) return

    if (open) {
      const active = document.activeElement
      origin.current = active instanceof HTMLElement ? active : null
      return
    }

    const element = origin.current
    origin.current = null
    if (element?.isConnected) element.focus()
  }, [open, trapped])
}

/* the positioner holds the edge; the border belongs to the part that animates */
const SIDE: Record<PanelSide, string> = {
  start: 'start-0 [--slide-from:-100%]',
  end: 'end-0 [--slide-from:100%]',
}

interface PanelProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly title: string
  readonly description?: string
  readonly footer?: ReactNode
  readonly side?: PanelSide
  readonly children: ReactNode
  readonly className?: string
}

/*
 * not modal while the table stays live: no focus trap, and a click outside picks the
 * next row rather than closing. on a screen it covers, it locks the page.
 */
export const Panel = ({
  open,
  onOpenChange,
  title,
  description,
  footer,
  side = 'end',
  children,
  className,
}: PanelProps) => {
  const sheet = useSheet()
  useReturnFocus(open, sheet)

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      modal={sheet}
      closeOnInteractOutside={false}
      unmountOnExit
      lazyMount
    >
      <Portal>
        <Dialog.Positioner className={cx('fixed inset-y-0 z-(--z-panel) flex', SIDE[side])}>
          <Dialog.Content
            className={cx(
              'layer flex h-full w-[min(420px,100vw)] flex-col border-reed-lit data-[state=open]:animate-[slide_var(--dur-overlay)_var(--ease-beat)] data-[state=closed]:animate-[slide-out_var(--dur-local)_var(--ease-exit)]',
              className,
            )}
          >
            <header className="reed-edge flex items-start justify-between gap-4 px-(--cell-x) py-(--stack)">
              <div className="flex min-w-0 flex-col gap-0.5">
                <Dialog.Title className="truncate font-medium">{title}</Dialog.Title>
                {description && (
                  <Dialog.Description className="truncate text-weft-dim">{description}</Dialog.Description>
                )}
              </div>
              <Dialog.CloseTrigger
                aria-label="Close the panel"
                className="-mr-1 cursor-pointer p-1 text-weft-faint transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft"
              >
                <CloseIcon className="size-3.5" />
              </Dialog.CloseTrigger>
            </header>

            <div className="reed-scroll flex-1 overflow-auto">{children}</div>

            {footer && (
              <footer className="flex items-center justify-end gap-(--stack) border-t border-reed px-(--cell-x) py-(--stack)">
                {footer}
              </footer>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
