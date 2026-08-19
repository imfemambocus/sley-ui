/* written by releases.mjs from the frozen bundles. do not edit. */
import type { ReleaseEntry } from './types'

export const LATEST = '0.4.0'

export const RELEASES: readonly ReleaseEntry[] = [
  {
    version: '0.4.0',
    items: 19,
    files: 21,
    first: false,
    added: [
      { item: 'chart', path: 'components/ui/chart/brush.ts' },
      { item: 'chart', path: 'components/ui/chart/motion.ts' },
    ],
    changed: [
      { item: 'tokens', path: 'styles/tokens.css' },
      { item: 'chart', path: 'components/ui/chart/Chart.tsx' },
    ],
    removed: [],
  },
  {
    version: '0.3.0',
    items: 19,
    files: 19,
    first: false,
    added: [
      { item: 'chart', path: 'components/ui/chart/Chart.tsx' },
    ],
    changed: [
      { item: 'tokens', path: 'styles/tokens.css' },
    ],
    removed: [],
  },
  {
    version: '0.2.2',
    items: 18,
    files: 18,
    first: false,
    added: [],
    changed: [
      { item: 'panel', path: 'components/ui/panel/Panel.tsx' },
    ],
    removed: [],
  },
  {
    version: '0.2.1',
    items: 18,
    files: 18,
    first: false,
    added: [],
    changed: [
      { item: 'table', path: 'components/ui/table/Table.tsx' },
    ],
    removed: [],
  },
  {
    version: '0.2.0',
    items: 18,
    files: 18,
    first: false,
    added: [],
    changed: [
      { item: 'table', path: 'components/ui/table/Table.tsx' },
    ],
    removed: [],
  },
  {
    version: '0.1.1',
    items: 18,
    files: 18,
    first: false,
    added: [],
    changed: [
      { item: 'table', path: 'components/ui/table/Table.tsx' },
    ],
    removed: [],
  },
  {
    version: '0.1.0',
    items: 18,
    files: 18,
    first: true,
    added: [],
    changed: [],
    removed: [],
  },
]
