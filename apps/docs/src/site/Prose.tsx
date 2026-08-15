import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

interface Props {
  readonly children: ReactNode
  readonly className?: string
}

export const PageTitle = ({ children }: Props) => (
  <h1 className="font-ui text-[30px] leading-tight font-semibold tracking-[-0.03em]">{children}</h1>
)

export const Lede = ({ children }: Props) => (
  <p className="max-w-2xl text-prose text-weft-dim">{children}</p>
)

interface SectionProps extends Props {
  readonly id: string
  readonly title: string
}

export const Section = ({ id, title, children, className }: SectionProps) => (
  <section id={id} className={cx('flex scroll-mt-28 flex-col gap-4', className)}>
    <h2 className="font-ui text-[19px] font-semibold tracking-[-0.02em]">{title}</h2>
    {children}
  </section>
)

export const P = ({ children, className }: Props) => (
  <p className={cx('max-w-2xl text-prose text-weft-dim', className)}>{children}</p>
)

export const List = ({ children }: Props) => (
  <ul className="flex max-w-2xl list-disc flex-col gap-2 pl-5 text-prose text-weft-dim marker:text-reed-lit">
    {children}
  </ul>
)

export const Code = ({ children }: Props) => (
  <code className="font-data text-[0.9em] text-weft">{children}</code>
)

/* the one aside shape on the site: a selvedge and nothing else */
export const Note = ({ children }: Props) => (
  <div className="selvedge selvedge-on max-w-2xl bg-raised py-2 pr-4 pl-4">
    <p className="text-prose text-weft-dim">{children}</p>
  </div>
)
