import { Dialog as ArkDialog, type DialogRootProps } from '@ark-ui/react/dialog'
import { Portal } from '@ark-ui/react/portal'
import type { ReactNode } from 'react'
import { CloseIcon } from '@/components/ui/icons/Icons'
import { cx } from '@/lib/cx'

/* ark removes the node when the exit animation ends. both mount options default on. */
export const Dialog = ({ unmountOnExit = true, lazyMount = true, ...props }: DialogRootProps) => (
  <ArkDialog.Root unmountOnExit={unmountOnExit} lazyMount={lazyMount} {...props} />
)

export const DialogTrigger = ArkDialog.Trigger

interface PartProps {
  readonly children: ReactNode
  readonly className?: string
}

/* ark names the dialog from its title, so every dialog carries one */
export const DialogContent = ({ children, className }: PartProps) => (
  <Portal>
    <ArkDialog.Backdrop className="fixed inset-0 z-(--z-backdrop) bg-sunken/70 backdrop-blur-[2px] data-[state=open]:animate-[fade_var(--dur-overlay)_var(--ease-beat)] data-[state=closed]:animate-[fade-out_var(--dur-local)_var(--ease-exit)]" />
    <ArkDialog.Positioner className="fixed inset-0 z-(--z-modal) grid place-items-center p-6">
      <ArkDialog.Content
        className={cx(
          'layer flex w-[min(480px,92vw)] flex-col data-[state=open]:animate-[rise_var(--dur-overlay)_var(--ease-beat)] data-[state=closed]:animate-[rise-out_var(--dur-local)_var(--ease-exit)]',
          className,
        )}
      >
        {children}
      </ArkDialog.Content>
    </ArkDialog.Positioner>
  </Portal>
)

export const DialogHeader = ({ children, className }: PartProps) => (
  <header
    className={cx('reed-edge flex items-start justify-between gap-4 px-(--cell-x) py-(--stack)', className)}
  >
    <div className="flex flex-col gap-1">{children}</div>
    <ArkDialog.CloseTrigger
      aria-label="Close"
      className="-mr-1 cursor-pointer p-1 text-weft-faint transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft"
    >
      <CloseIcon className="size-3.5" />
    </ArkDialog.CloseTrigger>
  </header>
)

export const DialogTitle = ({ children, className }: PartProps) => (
  <ArkDialog.Title className={cx('font-medium', className)}>{children}</ArkDialog.Title>
)

export const DialogDescription = ({ children, className }: PartProps) => (
  <ArkDialog.Description className={cx('text-weft-dim', className)}>{children}</ArkDialog.Description>
)

export const DialogBody = ({ children, className }: PartProps) => (
  <div className={cx('flex flex-col gap-(--stack) px-(--cell-x) py-4', className)}>{children}</div>
)

export const DialogFooter = ({ children, className }: PartProps) => (
  <footer
    className={cx('flex items-center justify-end gap-(--stack) border-t border-reed px-(--cell-x) py-(--stack)', className)}
  >
    {children}
  </footer>
)

export const DialogClose = ArkDialog.CloseTrigger
