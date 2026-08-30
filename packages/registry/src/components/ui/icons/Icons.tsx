import { cx } from '@/lib/cx'

interface IconProps {
  readonly className?: string
}

const base = 'shrink-0'

/*
 * one weight, one cap, one join. square terminals and mitred corners are the loom mark's own
 * construction, which is what stops a glyph reading as somebody else's line.
 */

export const CheckIcon = ({ className }: IconProps) => (
  <svg className={cx(base, className)} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <path d="M3.25 8.25 6.5 11.5 12.75 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
  </svg>
)

export const SearchIcon = ({ className }: IconProps) => (
  <svg className={cx(base, className)} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <circle cx="6.75" cy="6.75" r="4.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 10 13.75 13.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
)

export const ChevronIcon = ({ className }: IconProps) => (
  <svg className={cx(base, className)} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <path d="M3.75 6.25 8 10.5 12.25 6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
  </svg>
)

export const CloseIcon = ({ className }: IconProps) => (
  <svg className={cx(base, className)} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <path d="M4 4 12 12M12 4 4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
)
