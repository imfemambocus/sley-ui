import { cx } from '@/lib/cx'
import { NAV } from '../content/nav'
import { FRAMEWORK_LABEL, FRAMEWORK_MARK } from './FrameworkMark'
import { Link, useRoute } from './router'
import { Segmented } from './Segmented'
import { FRAMEWORKS, useSettings } from './settings'

interface SidebarProps {
  readonly onNavigate?: () => void
  readonly className?: string
}

/* every code block on the documentation reads this, so it sits above the pages rather than in the header */
const FrameworkChoice = () => {
  const { framework, setFramework } = useSettings()

  return (
    <Segmented
      legend="Framework"
      options={FRAMEWORKS}
      value={framework}
      onSelect={setFramework}
      className="self-start"
      renderOption={(option) => {
        const Mark = FRAMEWORK_MARK[option]
        return (
          <span className="flex items-center gap-2">
            <Mark />
            <span>{FRAMEWORK_LABEL[option]}</span>
          </span>
        )
      }}
    />
  )
}

export const Sidebar = ({ onNavigate, className }: SidebarProps) => {
  const { path } = useRoute()

  return (
    <nav aria-label="Documentation" className={cx('flex flex-col gap-7', className)}>
      <FrameworkChoice />

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
