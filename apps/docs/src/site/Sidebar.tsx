import { cx } from '@/lib/cx'
import { NAV } from '../content/nav'
import { Link, useRoute } from './router'

interface SidebarProps {
  readonly onNavigate?: () => void
  readonly className?: string
}

export const Sidebar = ({ onNavigate, className }: SidebarProps) => {
  const { path } = useRoute()

  return (
    <nav aria-label="Documentation" className={cx('flex flex-col gap-7', className)}>
      {NAV.map((group) => (
        <div key={group.label} className="flex flex-col gap-1.5">
          <p className="font-data text-[11px] tracking-[0.13em] text-weft-faint uppercase">{group.label}</p>
          <ul className="flex flex-col">
            {group.items.map((item) => {
              const current = item.href === path
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={current ? 'page' : undefined}
                    className={cx(
                      'selvedge flex h-(--ctl-h) items-center pl-3 transition-colors duration-(--dur-instant) ease-(--ease-beat)',
                      current
                        ? 'selvedge-on bg-indigo-wash text-weft'
                        : 'text-weft-dim hover:bg-shed hover:text-weft',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
