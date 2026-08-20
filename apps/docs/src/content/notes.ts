export interface Note {
  readonly slug: string
  readonly label: string
  readonly date: string
}

/* the date is here for the feed, which needs one per item, and no page carries a date of its own */
export const NOTES: readonly Note[] = [{ slug: 'row-window', label: 'The row window', date: '2026-08-20' }]
