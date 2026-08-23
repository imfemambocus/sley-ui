import { sparkPath, SPARK_VIEWBOX } from '@/components/ui/sparkline/path'
import { cx } from '@/lib/cx'

interface SparklineProps {
  readonly values: readonly number[]
  /* a shape reaches no screen reader, so the reading is carried in text beside it */
  readonly label: string
  /* pass one to hold a column of them on a single scale */
  readonly domain?: readonly [number, number]
  readonly className?: string
}

export const Sparkline = ({ values, label, domain, className }: SparklineProps) => (
  <span className={cx('flex items-center', className)}>
    {/* an em height follows the text of the cell it sits in, so the mark tightens with the knob */}
    <svg
      className="h-[1.5em] w-full"
      viewBox={SPARK_VIEWBOX}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* the box is stretched to the cell, and only a non-scaling stroke survives that undistorted */}
      <path
        d={sparkPath(values, domain)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
    <span className="sr-only">{label}</span>
  </span>
)
