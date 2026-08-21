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
  <figure className={cx('demo-frame', className)}>
    <div className={bleed ? undefined : 'demo-body'}>{children}</div>
    {caption && <figcaption className="demo-caption">{caption}</figcaption>}
  </figure>
)
