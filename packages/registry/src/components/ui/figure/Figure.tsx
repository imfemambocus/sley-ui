import { cx } from '@/lib/cx'

interface FigureProps {
  readonly value: number
  readonly digits?: number
  readonly low?: boolean
  readonly className?: string
}

/* anything that is not a digit reads one step back */
export const Figure = ({ value, digits = 1, low = false, className }: FigureProps) => {
  if (value === 0) return <span className={cx('reed-mark', className)} aria-hidden="true" />

  const [whole, fraction] = value.toFixed(digits).split('.')
  return (
    <span className={cx(low && 'reed-under', className)}>
      {whole}
      {fraction !== undefined && <span className="text-weft-faint">.{fraction}</span>}
      {low && <span className="sr-only"> below threshold</span>}
    </span>
  )
}

interface ElapsedProps {
  readonly minutes: number
  readonly className?: string
}

/* a head cannot hold two units, so a duration carries them in the cell */
export const Elapsed = ({ minutes, className }: ElapsedProps) => (
  <span className={className}>
    {Math.trunc(minutes / 60)}
    <span className="text-weft-faint">h </span>
    {String(minutes % 60).padStart(2, '0')}
    <span className="text-weft-faint">m</span>
  </span>
)
