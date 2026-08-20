export interface Note {
  readonly slug: string
  readonly label: string
  readonly date: string
}

/* the date is here for the feed, which needs one per item, and no page carries a date of its own */
export const NOTES: readonly Note[] = [
  { slug: 'row-window', label: 'The row window', date: '2026-08-20' },
  { slug: 'alignment', label: 'Aligning a control', date: '2026-08-20' },
  { slug: 'theme-fade', label: 'The theme fade', date: '2026-08-20' },
  { slug: 'row-cursor', label: 'The row cursor', date: '2026-08-20' },
  { slug: 'downsampling', label: 'Downsampling a line', date: '2026-08-20' },
]
