import { Toast as ArkToast, Toaster as ArkToaster, type CreateToasterReturn } from '@ark-ui/react/toast'
import { CloseIcon } from '@/components/ui/icons/Icons'
import { cx } from '@/lib/cx'

export { createToaster } from '@ark-ui/react/toast'
export type { CreateToasterReturn }

/*
 * the machine names the five kinds, and each one takes a dye. the dot repeats the
 * treatment the status column uses, so one state reads the same in both places.
 */
const TONE: Record<string, string> = {
  success: 'text-jade',
  error: 'text-madder',
  warning: 'text-weld',
  info: 'text-indigo',
  loading: 'text-weft-dim',
}

interface ToasterProps {
  readonly toaster: CreateToasterReturn
  readonly className?: string
}

/* zag gives the group the highest rank in the document, so no token ranks it here */
export const Toaster = ({ toaster, className }: ToasterProps) => (
  <ArkToaster toaster={toaster}>
    {(toast) => (
      <ArkToast.Root className={cx('toast layer flex w-[min(22rem,90vw)] items-start gap-2 p-(--cell-x)', className)}>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className={cx('flex items-center gap-1.5', TONE[toast.type ?? 'info'])}>
            <span className={cx('size-1.25 shrink-0 rounded-full bg-current', toast.type === 'loading' && 'beat')} />
            <ArkToast.Title className="truncate text-weft">{toast.title}</ArkToast.Title>
          </div>
          {toast.description && (
            <ArkToast.Description className="pl-2.75 text-weft-dim">{toast.description}</ArkToast.Description>
          )}
        </div>
        <ArkToast.CloseTrigger
          aria-label="Dismiss"
          className="cursor-pointer p-0.5 text-weft-faint transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft"
        >
          <CloseIcon className="size-3" />
        </ArkToast.CloseTrigger>
      </ArkToast.Root>
    )}
  </ArkToaster>
)
