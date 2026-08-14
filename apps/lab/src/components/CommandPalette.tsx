import { Dialog } from '@ark-ui/react/dialog'
import { Portal } from '@ark-ui/react/portal'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { SearchIcon } from './icons'

export interface Command {
  readonly id: string
  readonly label: string
  readonly group: string
  readonly hint?: string
  readonly run: () => void
}

interface CommandPaletteProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly commands: readonly Command[]
}

interface Entry {
  readonly command: Command
  readonly index: number
}

function groupCommands(commands: readonly Command[]) {
  const groups = new Map<string, Entry[]>()
  commands.forEach((command, index) => {
    const bucket = groups.get(command.group)
    if (bucket) {
      bucket.push({ command, index })
    } else {
      groups.set(command.group, [{ command, index }])
    }
  })
  return [...groups]
}

export const CommandPalette = ({ open, onOpenChange, commands }: CommandPaletteProps) => {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (needle === '') return commands
    return commands.filter((command) => `${command.group} ${command.label}`.toLowerCase().includes(needle))
  }, [commands, query])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  // keeping the highlighted row in view is the palette's job, not the browser's,
  // because the pointer never moves during keyboard navigation
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const choose = (command: Command) => {
    command.run()
    onOpenChange(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (matches.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => (current + 1) % matches.length)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => (current - 1 + matches.length) % matches.length)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      choose(matches[active])
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(details) => onOpenChange(details.open)} unmountOnExit lazyMount>
      <Portal>
        <Dialog.Backdrop className="fixed inset-0 z-(--z-backdrop) bg-sunken/70 backdrop-blur-[2px] data-[state=open]:animate-[fade_var(--dur-overlay)_var(--ease-beat)]" />
        <Dialog.Positioner className="fixed inset-0 z-(--z-modal) grid place-items-start justify-items-center pt-[12vh]">
          <Dialog.Content className="w-[min(560px,92vw)] border border-reed-lit bg-raised shadow-2xl shadow-black/40 data-[state=open]:animate-[rise_var(--dur-overlay)_var(--ease-beat)]">
            <Dialog.Title className="sr-only">Command palette</Dialog.Title>

            <div className="reed-edge flex items-center gap-2 px-3" style={{ height: 'calc(var(--ctl-h) + 12px)' }}>
              <SearchIcon className="size-4 text-weft-faint" />
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <input
                autoFocus
                name="command"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Run a command"
                aria-label="Run a command"
                className="w-full bg-transparent text-weft placeholder:text-weft-faint focus:outline-none"
              />
              <kbd className="font-data text-[11px] text-weft-faint">esc</kbd>
            </div>

            <div ref={listRef} className="max-h-[46vh] overflow-auto py-1">
              {matches.length === 0 && (
                <p className="px-3 py-6 text-center text-weft-dim">
                  No command matches {`"${query}"`}. Try a shorter word.
                </p>
              )}

              {groupCommands(matches).map(([group, items]) => (
                <div key={group}>
                  <p className="px-3 pt-2 pb-1 font-data text-[11px] tracking-wide text-weft-faint uppercase">
                    {group}
                  </p>
                  {items.map(({ command, index }) => {
                    const isActive = index === active
                    return (
                      <button
                        key={command.id}
                        type="button"
                        data-active={isActive}
                        onPointerMove={() => setActive(index)}
                        onClick={() => choose(command)}
                        className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 text-left text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) data-[active=true]:bg-indigo-wash data-[active=true]:text-weft"
                        style={{ height: 'var(--row-h)' }}
                      >
                        <span className="truncate">{command.label}</span>
                        {command.hint && <kbd className="font-data text-[11px] text-weft-faint">{command.hint}</kbd>}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
