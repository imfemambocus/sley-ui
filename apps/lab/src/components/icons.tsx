interface IconProps {
  readonly className?: string
}

const base = 'shrink-0'

export const CheckIcon = ({ className }: IconProps) => (
  <svg className={`${base} ${className ?? ''}`} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <path d="M3.5 8.5 6.5 11.5 12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
  </svg>
)

export const SearchIcon = ({ className }: IconProps) => (
  <svg className={`${base} ${className ?? ''}`} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const ChevronIcon = ({ className }: IconProps) => (
  <svg className={`${base} ${className ?? ''}`} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <path d="m4 6.5 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const CloseIcon = ({ className }: IconProps) => (
  <svg className={`${base} ${className ?? ''}`} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
