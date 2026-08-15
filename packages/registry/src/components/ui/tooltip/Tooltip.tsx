import { Tooltip as ArkTooltip } from '@ark-ui/react/tooltip'
import { Portal } from '@ark-ui/react/portal'
import type { ReactElement, ReactNode } from 'react'
import { cx } from '@/lib/cx'

interface TooltipProps {
  readonly content: ReactNode
  /* asChild: the trigger becomes this element */
  readonly children: ReactElement
  readonly openDelay?: number
  readonly closeDelay?: number
  readonly className?: string
}

/* faster than the ark default, for an interface with many small questions */
export const Tooltip = ({ content, children, openDelay = 200, closeDelay = 80, className }: TooltipProps) => (
  <ArkTooltip.Root openDelay={openDelay} closeDelay={closeDelay}>
    <ArkTooltip.Trigger asChild>{children}</ArkTooltip.Trigger>
    <Portal>
      <ArkTooltip.Positioner>
        <ArkTooltip.Content
          className={cx(
            'layer max-w-64 px-2 py-1 text-weft data-[state=open]:animate-[fade_var(--dur-instant)_var(--ease-beat)]',
            className,
          )}
        >
          {content}
        </ArkTooltip.Content>
      </ArkTooltip.Positioner>
    </Portal>
  </ArkTooltip.Root>
)
