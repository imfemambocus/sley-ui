import { Checkbox as ArkCheckbox } from '@ark-ui/react/checkbox'
import type { ReactNode } from 'react'
import { CheckIcon } from '@/components/ui/icons/Icons'
import { cx } from '@/lib/cx'

export type CheckedState = boolean | 'indeterminate'

interface CheckboxProps {
  readonly checked: CheckedState
  readonly onCheckedChange: (checked: CheckedState) => void
  readonly children?: ReactNode
  /* names a box that shows no text */
  readonly label?: string
  readonly className?: string
}

const CONTROL =
  'grid size-(--ctl-box) shrink-0 place-items-center border border-reed-lit text-ground transition-colors duration-(--dur-instant) ease-(--ease-beat) data-[state=checked]:border-indigo data-[state=checked]:bg-indigo data-[state=indeterminate]:border-indigo data-[state=indeterminate]:bg-indigo'

/* the ark root is a label element, so the text inside it toggles the box */
export const Checkbox = ({ checked, onCheckedChange, children, label, className }: CheckboxProps) => (
  <ArkCheckbox.Root
    checked={checked}
    onCheckedChange={(details) => onCheckedChange(details.checked)}
    className={cx('ctl-align inline-flex cursor-pointer items-center gap-2', className)}
  >
    <ArkCheckbox.Control className={CONTROL}>
      <ArkCheckbox.Indicator>
        <CheckIcon className="size-2.75" />
      </ArkCheckbox.Indicator>
      <ArkCheckbox.Indicator indeterminate>
        <span className="block h-px w-1.75 bg-current" />
      </ArkCheckbox.Indicator>
    </ArkCheckbox.Control>
    {children !== undefined && <ArkCheckbox.Label>{children}</ArkCheckbox.Label>}
    <ArkCheckbox.HiddenInput aria-label={children === undefined ? label : undefined} />
  </ArkCheckbox.Root>
)
