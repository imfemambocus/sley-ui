import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

interface EmptyStateProps {
  readonly title: string
  readonly description?: string
  readonly action?: ReactNode
  readonly className?: string
}

/* the text sits on a patch of cloth. no warp runs behind it. */
export const EmptyState = ({ title, description, action, className }: EmptyStateProps) => (
  <div
    className={cx('reed-warp flex flex-col items-center justify-center gap-(--stack) p-(--cell-x) text-center', className)}
    style={{ minHeight: 'calc(var(--row-h) * 4)' }}
  >
    <div className="flex flex-col gap-1 bg-raised px-(--cell-x)">
      <p className="text-weft-dim">{title}</p>
      {description && <p className="text-weft-faint">{description}</p>}
    </div>
    {action}
  </div>
)
