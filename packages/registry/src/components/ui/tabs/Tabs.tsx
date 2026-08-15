import { Tabs as ArkTabs } from '@ark-ui/react/tabs'
import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

export const Tabs = ArkTabs.Root

interface PartProps {
  readonly children: ReactNode
  readonly className?: string
}

/*
 * the mark is the selvedge of the list, and ark moves it from one tab to the next.
 * the list is the frame it is placed against, so it declares the position.
 */
export const TabsList = ({ children, className }: PartProps) => (
  <ArkTabs.List className={cx('relative flex items-center border-b border-reed', className)}>
    {children}
    <ArkTabs.Indicator className="selvedge selvedge-bottom selvedge-on tab-mark bottom-0 h-0.5 w-(--width)" />
  </ArkTabs.List>
)

interface TabsTabProps extends PartProps {
  readonly value: string
  readonly disabled?: boolean
}

export const TabsTab = ({ value, disabled, children, className }: TabsTabProps) => (
  <ArkTabs.Trigger
    value={value}
    disabled={disabled}
    className={cx(
      'h-(--ctl-h) cursor-pointer px-(--cell-x) text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:bg-shed hover:text-weft data-selected:text-weft disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
  >
    {children}
  </ArkTabs.Trigger>
)

interface TabsPanelProps extends PartProps {
  readonly value: string
}

export const TabsPanel = ({ value, children, className }: TabsPanelProps) => (
  <ArkTabs.Content value={value} className={cx('py-(--stack) focus:outline-none', className)}>
    {children}
  </ArkTabs.Content>
)
