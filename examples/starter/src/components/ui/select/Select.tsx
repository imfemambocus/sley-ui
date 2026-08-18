import { Portal } from '@ark-ui/react/portal'
import { Select as ArkSelect } from '@ark-ui/react/select'
import type { ReactNode } from 'react'
import { CheckIcon, ChevronIcon } from '@/components/ui/icons/Icons'
import { cx } from '@/lib/cx'

export { createListCollection } from '@ark-ui/react/select'

export interface SelectOptionItem {
  readonly label: string
  readonly value: string
}

export const Select = ArkSelect.Root

interface PartProps {
  readonly children: ReactNode
  readonly className?: string
}

export const SelectTrigger = ({ children, className }: PartProps) => (
  <ArkSelect.Control>
    <ArkSelect.Trigger className={cx('ctl h-(--ctl-h) cursor-pointer', className)}>
      {children}
      <ChevronIcon className="size-3 text-weft-faint" />
    </ArkSelect.Trigger>
  </ArkSelect.Control>
)

/* rank comes from the stylesheet; ark sets it inline on the positioner */
export const SelectContent = ({ children, className }: PartProps) => (
  <Portal>
    <ArkSelect.Positioner>
      <ArkSelect.Content className={cx('layer min-w-42 py-1 focus:outline-none', className)}>
        {children}
      </ArkSelect.Content>
    </ArkSelect.Positioner>
  </Portal>
)

interface SelectOptionProps {
  readonly item: SelectOptionItem
  readonly className?: string
}

/* the shed follows the keyboard, the selvedge marks the choice */
export const SelectOption = ({ item, className }: SelectOptionProps) => (
  <ArkSelect.Item
    item={item}
    className={cx(
      'selvedge flex cursor-pointer items-center justify-between gap-3 px-(--cell-x) py-1 text-weft-dim data-highlighted:bg-shed data-highlighted:text-weft data-[state=checked]:bg-indigo-wash data-[state=checked]:text-weft data-[state=checked]:selvedge-on',
      className,
    )}
  >
    <ArkSelect.ItemText>{item.label}</ArkSelect.ItemText>
    <ArkSelect.ItemIndicator>
      <CheckIcon className="size-3 text-indigo" />
    </ArkSelect.ItemIndicator>
  </ArkSelect.Item>
)
