import type { ComponentDoc } from '../types'
import { doc as button } from './button'
import { doc as chart } from './chart'
import { doc as checkbox } from './checkbox'
import { doc as commandPalette } from './command-palette'
import { doc as dialog } from './dialog'
import { doc as emptyState } from './empty-state'
import { doc as field } from './field'
import { doc as figure } from './figure'
import { doc as filterBar } from './filter-bar'
import { doc as icons } from './icons'
import { doc as panel } from './panel'
import { doc as popover } from './popover'
import { doc as select } from './select'
import { doc as table } from './table'
import { doc as tabs } from './tabs'
import { doc as toast } from './toast'
import { doc as tooltip } from './tooltip'

export const COMPONENT_DOCS: readonly ComponentDoc[] = [
  button,
  chart,
  checkbox,
  commandPalette,
  dialog,
  emptyState,
  field,
  figure,
  filterBar,
  icons,
  panel,
  popover,
  select,
  table,
  tabs,
  toast,
  tooltip,
]

export function findComponentDoc(slug: string) {
  return COMPONENT_DOCS.find((doc) => doc.slug === slug)
}
