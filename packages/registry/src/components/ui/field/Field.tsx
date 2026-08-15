import { Field as ArkField, type FieldRootProps } from '@ark-ui/react/field'
import { Fieldset } from '@ark-ui/react/fieldset'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cx } from '@/lib/cx'

export const Field = ({ className, ...props }: FieldRootProps) => (
  <ArkField.Root className={cx('flex flex-col gap-1', className)} {...props} />
)

interface PartProps {
  readonly children: ReactNode
  readonly className?: string
}

export const FieldLabel = ({ children, className }: PartProps) => (
  <ArkField.Label className={cx('flex items-center gap-1 text-weft-dim', className)}>
    {children}
    <ArkField.RequiredIndicator className="text-weft-faint" />
  </ArkField.Label>
)

const CONTROL = 'ctl block w-full data-invalid:border-madder disabled:cursor-not-allowed disabled:opacity-50'

export const FieldInput = ({ className, ...props }: ComponentPropsWithoutRef<'input'>) => (
  <ArkField.Input className={cx(CONTROL, 'h-(--ctl-h)', className)} {...props} />
)

export const FieldTextarea = ({ className, ...props }: ComponentPropsWithoutRef<'textarea'>) => (
  <ArkField.Textarea className={cx(CONTROL, 'min-h-20 resize-y py-(--stack) leading-relaxed', className)} {...props} />
)

export const FieldHint = ({ children, className }: PartProps) => (
  <ArkField.HelperText className={cx('text-weft-faint dense:sr-only', className)}>{children}</ArkField.HelperText>
)

export const FieldError = ({ children, className }: PartProps) => (
  <ArkField.ErrorText className={cx('text-madder', className)}>{children}</ArkField.ErrorText>
)

interface FieldSetProps {
  readonly legend: string
  readonly children: ReactNode
  readonly disabled?: boolean
  readonly className?: string
}

export const FieldSet = ({ legend, children, disabled, className }: FieldSetProps) => (
  <Fieldset.Root disabled={disabled} className={cx('flex flex-col gap-(--stack)', className)}>
    <Fieldset.Legend className="reed-edge w-full pb-(--stack) font-medium">{legend}</Fieldset.Legend>
    {children}
  </Fieldset.Root>
)
