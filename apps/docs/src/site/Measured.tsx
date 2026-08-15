export interface Measurement {
  readonly value: string
  readonly what: string
  readonly detail: string
}

interface MeasuredProps {
  readonly rows: readonly Measurement[]
}

/*
 * every value here was read out of a browser with getBoundingClientRect or canvas
 * measureText. the numbers are the argument, so they are printed rather than described.
 */
export const Measured = ({ rows }: MeasuredProps) => (
  <div className="max-w-3xl border border-reed bg-raised">
    <dl className="flex flex-col">
      {rows.map((row) => (
        <div
          key={row.what}
          className="flex flex-col gap-1 border-t border-reed/60 px-4 py-3 first:border-t-0 sm:flex-row sm:items-baseline sm:gap-5"
        >
          <dt className="tnum shrink-0 font-data text-[15px] text-indigo sm:w-32">{row.value}</dt>
          <dd className="flex flex-col gap-0.5">
            <span className="text-weft">{row.what}</span>
            <span className="text-weft-dim">{row.detail}</span>
          </dd>
        </div>
      ))}
    </dl>
  </div>
)
