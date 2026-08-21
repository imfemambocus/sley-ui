import { cx } from '@/lib/cx'
import type { Framework } from './settings'

/* inside a control, or beside a line of small capitals */
export type MarkSize = 'control' | 'eyebrow'

interface MarkProps {
  readonly size?: MarkSize
  /* the mark in its own colours rather than the colour of the text around it */
  readonly brand?: boolean
  readonly className?: string
}

/*
 * one logo is thin strokes that spill past its viewBox and the other is a solid pair of
 * chevrons two thirds as tall as it is wide, so the same box gives them different ink and
 * the same ink does not read as the same size: a solid form of a given height looks larger
 * than an outlined one. the eyebrow pair therefore shares a box, which puts the stroked
 * mark 12.4px by 13.1px against the solid 13px by 11.3px, and the two read as equals.
 */
const REACT_BOX: Record<MarkSize, string> = { control: 'size-[15px]', eyebrow: 'size-[13px]' }
const VUE_BOX: Record<MarkSize, string> = { control: 'size-[17px]', eyebrow: 'size-[13px]' }

const ReactMark = ({ size = 'control', brand = false, className }: MarkProps) => (
  <svg
    className={cx('shrink-0', REACT_BOX[size], className)}
    viewBox="-11.5 -10.232 23 20.464"
    fill="none"
    style={brand ? { color: 'var(--brand-react)' } : undefined}
    aria-hidden="true"
    focusable="false"
  >
    <circle r="2.05" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="1">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
)

/* the inner chevron is a second colour in the real mark, and a wash of the first without it */
const VueMark = ({ size = 'control', brand = false, className }: MarkProps) => (
  <svg
    className={cx('shrink-0', VUE_BOX[size], className)}
    viewBox="0 0 261.76 226.69"
    fill="currentColor"
    style={brand ? { color: 'var(--brand-vue)' } : undefined}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M0 0h52.36l78.52 135.7L209.4 0h52.36L130.88 226.69z" />
    <path
      d="M52.36 0h52.36l26.16 45.31L157.04 0h52.36l-78.52 135.7z"
      fill={brand ? 'var(--brand-vue-shade)' : undefined}
      opacity={brand ? undefined : 0.55}
    />
  </svg>
)

export const FRAMEWORK_MARK: Record<Framework, typeof ReactMark> = {
  react: ReactMark,
  vue: VueMark,
}

export const FRAMEWORK_LABEL: Record<Framework, string> = {
  react: 'React',
  vue: 'Vue',
}
