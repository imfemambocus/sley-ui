import type { RunStatus } from './runs'

export const STATUS_TONE: Record<RunStatus, string> = {
  complete: 'text-jade',
  running: 'text-indigo',
  queued: 'text-weft-faint',
  failed: 'text-madder',
}
