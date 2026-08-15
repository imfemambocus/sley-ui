import type { ComponentPropsWithoutRef } from 'react'
import { cx } from '@/lib/cx'

export type ButtonVariant = 'default' | 'primary' | 'danger' | 'quiet'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  readonly variant?: ButtonVariant
}

const VARIANT: Record<ButtonVariant, string> = {
  default: 'ctl',
  primary: 'border border-indigo bg-indigo text-ground hover:bg-indigo/90',
  danger: 'border border-madder bg-madder text-ground hover:bg-madder/90',
  quiet: 'text-weft-dim hover:text-weft',
}

export const Button = ({ variant = 'default', type = 'button', className, ...props }: ButtonProps) => (
  <button
    type={type}
    className={cx(
      'inline-flex h-(--ctl-h) cursor-pointer items-center justify-center gap-1.5 px-(--cell-x) transition-colors duration-(--dur-instant) ease-(--ease-beat) disabled:cursor-not-allowed disabled:opacity-50',
      VARIANT[variant],
      className,
    )}
    {...props}
  />
)
