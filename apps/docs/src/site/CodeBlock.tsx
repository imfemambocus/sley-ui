import { useEffect, useState } from 'react'
import { cx } from '@/lib/cx'

interface CodeBlockProps {
  readonly code: string
  /* a shell block prints a prompt the reader must not copy */
  readonly shell?: boolean
  readonly className?: string
}

export const CodeBlock = ({ code, shell = false, className }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return undefined
    const timer = window.setTimeout(() => setCopied(false), 1400)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = () => {
    navigator.clipboard.writeText(code).then(
      () => setCopied(true),
      () => setCopied(false),
    )
  }

  return (
    <div className={cx('group relative max-w-2xl border border-reed bg-sunken', className)}>
      <pre className="overflow-x-auto p-4 font-data text-[13px] leading-relaxed text-weft">
        {shell
          ? code.split('\n').map((line) => (
              <span key={line} className="block">
                <span className="text-weft-faint select-none">$ </span>
                {line}
              </span>
            ))
          : code}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 h-6 cursor-pointer border border-reed bg-ground px-2 font-data text-[11px] text-weft-dim opacity-0 transition-[color,opacity] duration-(--dur-instant) ease-(--ease-beat) group-hover:opacity-100 hover:text-weft focus-visible:opacity-100"
      >
        {copied ? 'copied' : 'copy'}
      </button>
    </div>
  )
}
