import { Button } from '@/components/ui/button/Button'
import { Checkbox } from '@/components/ui/checkbox/Checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover/Popover'
import type { Column } from '@/components/ui/table/Table'
import type { Run } from '../data/runs'

interface ColumnMenuProps {
  readonly columns: readonly Column<Run>[]
  readonly hidden: ReadonlySet<string>
  readonly onToggle: (key: string) => void
}

export const ColumnMenu = ({ columns, hidden, onToggle }: ColumnMenuProps) => (
  <Popover positioning={{ placement: 'bottom-end' }}>
    <PopoverTrigger asChild>
      <Button>
        <span className="inline-flex items-baseline gap-1.5">
          <span>Columns</span>
          {hidden.size > 0 && <span className="tnum font-data text-indigo">{hidden.size}</span>}
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent>
      <ul>
        {columns.map((column) => (
          <li key={column.key}>
            <Checkbox
              checked={!hidden.has(column.key)}
              onCheckedChange={() => onToggle(column.key)}
              className="w-full px-(--cell-x) py-1 text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:bg-shed hover:text-weft"
            >
              {column.label}
            </Checkbox>
          </li>
        ))}
      </ul>
    </PopoverContent>
  </Popover>
)
