import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

interface DemoProps {
  readonly children: ReactNode
  readonly caption?: string
  /* a table or a console fills its frame; a control sits in the middle of one */
  readonly bleed?: boolean
  readonly className?: string
}

export const Demo = ({ children, caption, bleed = false, className }: DemoProps) => (
  <figure className={cx('flex max-w-full flex-col border border-reed bg-raised', className)}>
    <div className={cx(bleed ? 'p-0' : 'flex flex-wrap items-center gap-4 p-6')}>{children}</div>
    {caption && (
      <figcaption className="border-t border-reed px-4 py-2 font-data text-[12px] text-weft-faint">
        {caption}
      </figcaption>
    )}
  </figure>
)
