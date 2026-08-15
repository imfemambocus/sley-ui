import { cx } from '@/lib/cx'

interface WordmarkProps {
  readonly className?: string
}

/*
 * the reed with the warp standing in it, and the pick the beat has just driven down.
 * the same drawing as the readme banner and the favicon.
 */
export const LoomMark = ({ className }: WordmarkProps) => (
  <svg className={cx('shrink-0', className)} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
    <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <line x1="5" y1="4" x2="5" y2="28" />
      <line x1="12" y1="4" x2="12" y2="28" />
      <line x1="19" y1="4" x2="19" y2="28" />
      <line x1="26" y1="4" x2="26" y2="28" />
      <line x1="3" y1="21.5" x2="29" y2="21.5" />
    </g>
  </svg>
)

export const Wordmark = ({ className }: WordmarkProps) => (
  <span className={cx('inline-flex items-center gap-2', className)}>
    <LoomMark className="size-4.5 text-indigo" />
    <span className="font-ui text-[19px] leading-none font-bold tracking-[-0.045em] text-weft">sley</span>
  </span>
)
