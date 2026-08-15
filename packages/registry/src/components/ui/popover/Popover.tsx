import { Popover as ArkPopover } from '@ark-ui/react/popover'
import { Portal } from '@ark-ui/react/portal'
import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

export const Popover = ArkPopover.Root
export const PopoverTrigger = ArkPopover.Trigger

interface PartProps {
  readonly children: ReactNode
  readonly className?: string
}

/* the positioner takes its rank from the stylesheet, which reaches ark's inline value */
export const PopoverContent = ({ children, className }: PartProps) => (
  <Portal>
    <ArkPopover.Positioner>
      <ArkPopover.Content
        className={cx(
          'layer min-w-52 py-1 focus:outline-none data-[state=open]:animate-[rise_var(--dur-local)_var(--ease-beat)]',
          className,
        )}
      >
        {children}
      </ArkPopover.Content>
    </ArkPopover.Positioner>
  </Portal>
)

export const PopoverTitle = ({ children, className }: PartProps) => (
  <ArkPopover.Title className={cx('reed-edge px-(--cell-x) pt-1 pb-(--stack) font-medium', className)}>
    {children}
  </ArkPopover.Title>
)

export const PopoverDescription = ({ children, className }: PartProps) => (
  <ArkPopover.Description className={cx('px-(--cell-x) py-1 text-weft-dim', className)}>
    {children}
  </ArkPopover.Description>
)
