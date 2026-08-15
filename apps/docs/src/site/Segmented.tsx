import { cx } from '@/lib/cx'

interface SegmentedProps<T extends string> {
  readonly legend: string
  readonly options: readonly T[]
  readonly value: T
  readonly onSelect: (next: T) => void
  readonly className?: string
}

export const Segmented = <T extends string>({
  legend,
  options,
  value,
  onSelect,
  className,
}: SegmentedProps<T>) => (
  <fieldset className={cx('flex items-center border border-reed', className)}>
    <legend className="sr-only">{legend}</legend>
    {options.map((option) => (
      <button
        key={option}
        type="button"
        aria-pressed={option === value}
        onClick={() => onSelect(option)}
        className="h-(--ctl-h) cursor-pointer px-(--cell-x) text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft aria-pressed:bg-indigo-wash aria-pressed:text-weft"
      >
        {option}
      </button>
    ))}
  </fieldset>
)
