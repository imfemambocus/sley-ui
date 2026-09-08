<script lang="ts">
export type SortDirection = 'asc' | 'desc'

export interface Sort {
  readonly key: string
  readonly direction: SortDirection
}

export interface Column<T> {
  readonly key: string
  readonly label: string
  readonly unit?: string
  readonly hint?: string
  /* the widest plausible value, in characters. the density turns it into a width. */
  readonly chars: number
  readonly numeric?: boolean
  readonly sortValue?: (row: T) => string | number
}

export type RowNoun = string | readonly [one: string, many: string]
</script>

<script setup lang="ts" generic="T">
import { computed, getCurrentInstance, ref, shallowRef, watch, watchEffect, type HTMLAttributes } from 'vue'
import Checkbox, { type CheckedState } from '@/components/ui/checkbox/Checkbox.vue'
import EmptyState from '@/components/ui/empty-state/EmptyState.vue'
import ColumnGrip from '@/components/ui/table/ColumnGrip.vue'
import ColumnHead from '@/components/ui/table/ColumnHead.vue'
import Tooltip from '@/components/ui/tooltip/Tooltip.vue'
import { cx } from '@/lib/cx'

const props = withDefaults(
  defineProps<{
    rows: readonly T[]
    columns: readonly Column<T>[]
    rowId: (row: T) => string
    title: string
    noun?: RowNoun
    emptyMessage?: string
    loading?: boolean
    /*
     * the three pieces of state a reader sets and an application may want to keep. bind a
     * model to own one, or bind none and the table holds it.
     */
    sort?: Sort | null
    widths?: Readonly<Record<string, number | undefined>>
    order?: readonly string[]
    class?: HTMLAttributes['class']
  }>(),
  { noun: () => 'rows', emptyMessage: 'No row matches the filters.', loading: false },
)

const emit = defineEmits<{
  'update:sort': [sort: Sort | null]
  'update:widths': [widths: Readonly<Record<string, number | undefined>>]
  'update:order': [order: readonly string[]]
  selectionChange: [selected: ReadonlySet<string>]
  rowActivate: [row: T]
}>()

/*
 * a declared emit is stripped out of $attrs, so the vnode props are the only place left that
 * says whether the caller listens. the row draws a pointer only when one does.
 */
const instance = getCurrentInstance()
const activates = computed(() => instance?.vnode.props?.onRowActivate !== undefined)

/* a cell draws from the slot named after its column: the caller keeps its markup in a template */
defineSlots<{
  actions?: () => unknown
  [cell: `cell-${string}`]: (slotProps: { row: T }) => unknown
}>()

const MIN_WIDTH = 56
const MAX_WIDTH = 420

/* the 7px mark and its 6px gap: two characters cover both in every density */
const SORT_CHARS = 2

/*
 * a press travelling this far is a column being moved rather than a column being sorted. it is
 * wide enough that the travel in an ordinary click cannot reach it, since a press that arms the
 * drag is a press that no longer sorts.
 */
const MOVE_THRESHOLD = 8

/*
 * the column the pointer carries travels above its neighbours, so it needs the row's own
 * background: a transparent cell would let the values underneath read through it. that is the
 * pinned cell's problem and this is the pinned cell's answer. it takes the leading divider its
 * own cells draw as well, or the head arrives over its neighbours as a smear with no edge.
 */
const CARRIED = 'warp-line relative z-(--z-grip) cursor-grabbing bg-inherit'

/* the columns it passes step aside, which is the one place the table animates its layout */
const SLIDING = 'transition-[translate] duration-(--dur-local) ease-(--ease-beat)'

/*
 * below this many rows the whole body is rendered. the widest viewport shows about 20
 * rows at the dense height, so this leaves several screens before a window is worth it.
 */
const WINDOW_MIN = 100
const OVERSCAN = 6

/*
 * the row height arrives from a measurement, which leaves the first commit of a long
 * batch without one. 40 rows covers the 520px body cap at the dense height with the
 * overscan on top.
 */
const FIRST_ROWS = 40

/* doubles as the left offset of the pinned column beside it */
const GUTTER = 'calc(var(--cell-x) * 2 + var(--ctl-box))'

/*
 * a pinned cell hides what travels under it, so it needs an opaque background and a
 * transition of its own. a parent transition does not animate an inherited value.
 */
const PINNED = 'warp-line-end bg-inherit px-(--cell-x) transition-colors duration-(--dur-instant) ease-(--ease-beat)'

const SKELETON_IDS: readonly string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => `warp-${id}`)

const NAV_KEYS: ReadonlySet<string> = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End'])

/* a control in a cell owns its own click, and the checkbox sits inside a label */
const INTERACTIVE = 'a, button, input, select, textarea, label'

function compare(a: string | number, b: string | number) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

/* a plural noun alone reads "1 rows" at a count of one, so a caller can give both forms */
function countNoun(noun: RowNoun, count: number) {
  if (typeof noun === 'string') return noun
  return count === 1 ? noun[0] : noun[1]
}

function clampWidth(value: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(value)))
}

/* one column at a time, and the third press restores the order the rows arrived in */
function cycleSort(sort: Sort | null, key: string): Sort | null {
  if (sort?.key !== key) return { key, direction: 'asc' }
  if (sort.direction === 'asc') return { key, direction: 'desc' }
  return null
}

/*
 * the held order is a preference and not the list itself. a column the caller drops falls
 * out, a column it adds lands at the end, and a column that comes back returns to the place
 * it held.
 */
function ordering(columns: readonly Column<T>[], order: readonly string[]) {
  const byKey = new Map(columns.map((column) => [column.key, column]))
  const held = order.map((key) => byKey.get(key)).filter((column) => column !== undefined)
  return [...held, ...columns.filter((column) => !order.includes(column.key))]
}

/*
 * `to` is an insertion point in the list as it stands, which is how a drop between two
 * columns is expressed. the first data column names the row and is pinned there, so nothing
 * lands in front of it, and a move onto either side of where the column already sits is no
 * move at all.
 */
function moveColumn(keys: readonly string[], key: string, to: number): readonly string[] {
  const from = keys.indexOf(key)
  const at = Math.min(Math.max(to, 1), keys.length)
  if (from === -1 || at === from || at === from + 1) return keys
  const rest = keys.filter((entry) => entry !== key)
  const landing = at > from ? at - 1 : at
  return [...rest.slice(0, landing), key, ...rest.slice(landing)]
}

/*
 * the head counts too, because a label and its unit can run longer than the value
 * under it. the half character covers the rounding a table layout applies.
 *
 * the head is drawn in the interface face and the value under it in the data face,
 * so the head takes whichever of the two advances is wider. `1ch` is the interface
 * face's own digit advance, read off this cell. where the data face is the wider of
 * the pair the expression collapses to what it always was.
 */
function intrinsicWidth(column: Column<T>, reserved: number) {
  const unit = column.unit ? column.unit.length + 1 : 0
  const head = column.label.length + unit + reserved
  const value = `${column.chars + 0.5} * var(--data-adv)`
  const label = `${head + 0.5} * max(var(--data-adv), 1ch)`
  return `calc(max(${value}, ${label}) + var(--cell-x) * 2)`
}

/* what the head reserves for its mark, and only while it carries one */
function headChars(direction: SortDirection | undefined) {
  return direction === undefined ? 0 : SORT_CHARS
}

/* a css length needs its unit; vue writes a bare number as it stands */
const px = (value: string | number) => (typeof value === 'number' ? `${value}px` : value)

const selected = shallowRef<ReadonlySet<string>>(new Set())
const cursor = ref<string | null>(null)

/*
 * a caller that binds the model owns that piece of state, and one that binds nothing gets
 * the table's own. either way the setter takes the whole next value, so a caller never has
 * to read the table back to know what it holds.
 */
function model<V>(read: () => V | undefined, report: (next: V) => void, initial: V) {
  const inner = shallowRef<V>(initial)
  /* undefined is the only absence: a caller can hold null, which is a sort of nothing */
  const value = computed(() => {
    const held = read()
    return held === undefined ? inner.value : held
  })
  const set = (next: V) => {
    if (read() === undefined) inner.value = next
    report(next)
  }
  return [value, set] as const
}

/* only a dragged column holds a px width; the rest follow the density */
const [widths, setWidths] = model<Readonly<Record<string, number | undefined>>>(
  () => props.widths,
  (next) => emit('update:widths', next),
  {},
)
const [sort, setSort] = model<Sort | null>(() => props.sort, (next) => emit('update:sort', next), null)
const [order, setOrder] = model<readonly string[]>(() => props.order, (next) => emit('update:order', next), [])

/*
 * a column being moved: where it started, the boundary it would land on, its own width, and
 * how far the pointer has carried it. the width is what every other column steps aside by.
 */
const drag = shallowRef<{
  readonly key: string
  readonly from: number
  readonly to: number
  readonly width: number
  readonly dx: number
} | null>(null)

/* raised by a key press, so the focus chase below ignores a scroll the pointer made */
let chasing = false

const drawn = computed(() => ordering(props.columns, order.value))
const keys = computed(() => drawn.value.map((column) => column.key))

const span = computed(() => drawn.value.length + 2)

const resizeColumn = (key: string, next: number) => {
  setWidths({ ...widths.value, [key]: clampWidth(next) })
}

/* raised the moment a press becomes a drag, and read by the head it started on */
let dragged = false

/*
 * a press that armed the drag is not a sort, however the browser routes the click that follows
 * it. a key press reports no click count, which is the one click that always is.
 */
const sortColumn = (key: string, keyed: boolean) => {
  if (!keyed && dragged) return
  setSort(cycleSort(sort.value, key))
}

/* one place a press, from the grip that also carries the width */
const nudgeColumn = (key: string, by: number) => {
  const index = keys.value.indexOf(key)
  setOrder(moveColumn(keys.value, key, by > 0 ? index + 2 : index - 1))
}

const ordered = computed(() => {
  const chosen = sort.value
  const column = props.columns.find((entry) => entry.key === chosen?.key)
  const value = column?.sortValue
  if (chosen === null || value === undefined) return props.rows
  const factor = chosen.direction === 'asc' ? 1 : -1
  return [...props.rows].sort((a, b) => factor * compare(value(a), value(b)))
})

const directionOf = (column: Column<T>) => (sort.value?.key === column.key ? sort.value.direction : undefined)

const widthOf = (column: Column<T>) => {
  const set = widths.value[column.key]
  if (set !== undefined) return px(set)
  return intrinsicWidth(column, headChars(directionOf(column)))
}

const ariaSort = (column: Column<T>) => {
  if (column.sortValue === undefined) return undefined
  const direction = directionOf(column)
  if (direction === undefined) return 'none'
  return direction === 'asc' ? 'ascending' : 'descending'
}

/*
 * a filter can take a selected row off the screen. the count and the head control
 * read only what is on screen, and the set keeps the rest for when it comes back.
 */
const onScreen = computed(() => new Set(props.rows.map(props.rowId)))
const active = computed(() => new Set([...selected.value].filter((id) => onScreen.value.has(id))))

const headerState = computed<CheckedState>(() => {
  if (active.value.size === 0) return false
  if (active.value.size === props.rows.length) return true
  return 'indeterminate'
})

/*
 * every row is exactly --row-h, so the window is arithmetic and needs no per row
 * measurement. the height is read off a real row rather than the token, which keeps
 * it right when the density changes under the component.
 */
const scroller = ref<HTMLDivElement | null>(null)
const headRow = ref<HTMLTableRowElement | null>(null)
const metrics = ref({ rowHeight: 0, viewport: 0 })
const scrollTop = ref(0)

const long = computed(() => ordered.value.length > WINDOW_MIN)

/* the empty message holds to the visible width, which only the box itself can report */
watchEffect((onCleanup) => {
  const box = scroller.value
  if (!box || ordered.value.length > 0) return

  const read = () => box.style.setProperty('--table-view', `${box.clientWidth}px`)
  read()

  const observer = new ResizeObserver(read)
  observer.observe(box)
  onCleanup(() => observer.disconnect())
})

/*
 * the head row carries the same --row-h and keeps its identity for the life of the
 * table, so it is the one element that can be observed. a body row is re-keyed on
 * every scroll, which leaves the observer watching a detached node.
 */
watchEffect((onCleanup) => {
  const box = scroller.value
  const head = headRow.value
  if (!box || !head || !long.value) return

  const read = () => {
    metrics.value = { rowHeight: head.getBoundingClientRect().height, viewport: box.clientHeight }
  }
  read()

  const observer = new ResizeObserver(read)
  observer.observe(box)
  observer.observe(head)
  onCleanup(() => observer.disconnect())
})

const view = computed(() => {
  const total = ordered.value.length
  if (!long.value) return { start: 0, end: total, before: 0, after: 0 }
  /* the spacer height is unknown until the row height arrives, and a short body corrects itself */
  if (metrics.value.rowHeight === 0) return { start: 0, end: Math.min(total, FIRST_ROWS), before: 0, after: 0 }

  const visible = Math.ceil(metrics.value.viewport / metrics.value.rowHeight)
  const start = Math.max(0, Math.floor(scrollTop.value / metrics.value.rowHeight) - OVERSCAN)
  const end = Math.min(total, start + visible + OVERSCAN * 2)
  return {
    start,
    end,
    before: start * metrics.value.rowHeight,
    after: (total - end) * metrics.value.rowHeight,
  }
})

const windowed = computed(() =>
  ordered.value.slice(view.value.start, view.value.end).map((row, offset) => ({
    row,
    id: props.rowId(row),
    position: view.value.start + offset,
  })),
)

const onScroll = () => {
  if (long.value) scrollTop.value = scroller.value?.scrollTop ?? 0
}

const cursorIndex = computed(() => {
  if (cursor.value === null) return -1
  return ordered.value.findIndex((row) => props.rowId(row) === cursor.value)
})

/*
 * the row the cursor is on holds the only tab stop in the body, so leaving the table
 * and coming back returns to it. a pointer scroll can carry that row out of the
 * window, and the first rendered row takes the stop until an arrow moves it again.
 */
const stop = computed(() =>
  cursorIndex.value >= view.value.start && cursorIndex.value < view.value.end ? cursorIndex.value : view.value.start,
)

const moveCursor = (index: number) => {
  const next = ordered.value[Math.min(Math.max(index, 0), ordered.value.length - 1)]
  if (next === undefined) return
  chasing = true
  cursor.value = props.rowId(next)
}

const navigate = (from: number, key: string) => {
  if (key === 'ArrowDown') moveCursor(from + 1)
  if (key === 'ArrowUp') moveCursor(from - 1)
  if (key === 'Home') moveCursor(0)
  if (key === 'End') moveCursor(ordered.value.length - 1)
}

/*
 * a row outside the window does not exist to focus, so the scroll goes first and the
 * watcher runs again on the view it produces. `chasing` keeps it off a pointer scroll,
 * which must not pull focus.
 */
watch(
  [cursorIndex, view, metrics],
  () => {
    if (!chasing || cursorIndex.value === -1) return

    const box = scroller.value
    const row = box?.querySelector<HTMLTableRowElement>(`tbody tr[aria-rowindex='${cursorIndex.value + 2}']`)
    if (row) {
      chasing = false
      row.focus({ preventScroll: true })
      row.scrollIntoView({ block: 'nearest' })
      return
    }

    if (box && metrics.value.rowHeight > 0) {
      const top = cursorIndex.value * metrics.value.rowHeight
      const above = top < box.scrollTop
      box.scrollTop = above ? top : top - metrics.value.viewport + metrics.value.rowHeight
    }
  },
  { flush: 'post' },
)

const applySelection = (next: ReadonlySet<string>) => {
  selected.value = next
  emit('selectionChange', new Set([...next].filter((id) => onScreen.value.has(id))))
}

const toggleRow = (id: string) => {
  const next = new Set(selected.value)
  if (!next.delete(id)) next.add(id)
  applySelection(next)
}

const toggleAll = () => {
  const next = new Set(selected.value)
  if (active.value.size === props.rows.length) {
    onScreen.value.forEach((id) => next.delete(id))
  } else {
    onScreen.value.forEach((id) => next.add(id))
  }
  applySelection(next)
}

/* the column the pointer carries, and the whole row of steps its neighbours take */
const shiftOf = (index: number) => {
  const moving = drag.value
  if (moving === null) return 0
  if (index === moving.from) return moving.dx
  if (moving.to <= index && index < moving.from) return moving.width
  if (moving.from < index && index < moving.to) return -moving.width
  return 0
}

const move = computed(() => {
  const moving = drag.value
  if (moving === null) return null
  return { index: moving.from, shifts: keys.value.map((_, index) => shiftOf(index)) }
})


const headCells = () => [...(headRow.value?.querySelectorAll<HTMLTableCellElement>('th[data-column]') ?? [])]

/*
 * the head cells are read on every move rather than once, since a sideways scroll under the
 * drag would leave a cached geometry naming the wrong boundary. the step each one has taken
 * comes off its rect again, or a boundary would move as the reader crossed it and the landing
 * would flicker between two columns. the first data column is pinned where it is, so the
 * earliest landing is in front of the second.
 */
const dropAt = (x: number) => {
  const cells = headCells()
  for (const [index, cell] of cells.entries()) {
    const box = cell.getBoundingClientRect()
    const left = box.left - shiftOf(index)
    if (x >= left + box.width) continue
    return Math.max(1, x < left + box.width / 2 ? index : index + 1)
  }
  return cells.length
}

/*
 * the column travels inside what the reader can see, so a sideways scrolled table cannot carry
 * it under the pinned pair, where an opaque cell of a higher rank would swallow it whole.
 */
const travelLimits = (cell: HTMLTableCellElement) => {
  const cells = headCells()
  const box = cell.getBoundingClientRect()
  const visible = scroller.value?.getBoundingClientRect()
  const pinned = cells.at(0)?.getBoundingClientRect()
  const last = cells.at(-1)?.getBoundingClientRect()
  if (visible === undefined || pinned === undefined || last === undefined) return { min: 0, max: 0 }
  return {
    min: Math.min(0, Math.max(pinned.right, visible.left) - box.left),
    max: Math.max(0, Math.min(last.right, visible.right) - box.right),
  }
}

/*
 * the capture is taken on the first move past the threshold and not on the press, which
 * leaves a plain press as a press: chrome dispatches the click to the capturing element,
 * so a captured head would swallow the sort its own button was waiting for.
 */
let origin: number | null = null
let limits = { min: 0, max: 0 }

/* a press that starts on the grip belongs to the width, and its moves reach this cell too */
const startMove = (event: PointerEvent) => {
  const onGrip = event.target instanceof Element && event.target.closest('[data-grip]') !== null
  dragged = false
  origin = onGrip || event.button !== 0 ? null : event.clientX
}

/*
 * a move arrives whether a button is held or not, so a drag runs only while one is: an origin
 * a plain press left behind would carry the column off on the next move across the cell.
 */
const trackMove = (event: PointerEvent, key: string) => {
  const cell = event.currentTarget
  if (!(cell instanceof HTMLTableCellElement)) return
  if (event.buttons === 0) {
    if (!cell.hasPointerCapture(event.pointerId)) origin = null
    return
  }
  if (!cell.hasPointerCapture(event.pointerId)) {
    if (origin === null || Math.abs(event.clientX - origin) < MOVE_THRESHOLD) return
    cell.setPointerCapture(event.pointerId)
    dragged = true
    /* read before the first step is painted, so the room to travel is the layout's own */
    limits = travelLimits(cell)
  }
  if (origin === null) return
  const dx = Math.min(Math.max(event.clientX - origin, limits.min), limits.max)
  drag.value = { key, from: keys.value.indexOf(key), to: dropAt(event.clientX), width: cell.offsetWidth, dx }
}

/* the press that sorted is over, and it leaves nothing behind for a later move to pick up */
const dropMove = () => {
  origin = null
}

/* the release decides, so a move and a release inside one frame cannot land a boundary late */
const endMove = (event: PointerEvent, key: string) => {
  setOrder(moveColumn(keys.value, key, dropAt(event.clientX)))
  origin = null
  drag.value = null
}

const onRowClick = (event: MouseEvent, row: T) => {
  if (!activates.value) return
  if (event.target instanceof Element && event.target.closest(INTERACTIVE) !== null) return
  emit('rowActivate', row)
}

const onRowKeyDown = (event: KeyboardEvent, id: string, position: number, row: T) => {
  /* a key pressed on the checkbox inside the row belongs to the checkbox */
  if (event.target !== event.currentTarget) return

  if (event.key === ' ') {
    event.preventDefault()
    toggleRow(id)
    return
  }

  if (event.key === 'Enter' && activates.value) {
    event.preventDefault()
    emit('rowActivate', row)
    return
  }

  if (!NAV_KEYS.has(event.key)) return
  event.preventDefault()
  navigate(position, event.key)
}
</script>

<template>
  <section :class="cx('@container isolate border border-reed bg-raised', props.class)">
    <header class="flex items-center justify-between gap-(--stack) border-b border-reed px-(--cell-x) py-(--stack)">
      <h2 class="font-medium">{{ props.title }}</h2>
      <div class="flex items-center gap-(--stack)">
        <p v-if="!props.loading" class="tnum text-weft-dim">
          {{
            active.size > 0
              ? `${active.size} of ${props.rows.length} selected`
              : `${props.rows.length} ${countNoun(props.noun, props.rows.length)}`
          }}
        </p>
        <slot name="actions" />
      </div>
    </header>

    <div ref="scroller" class="reed-scroll max-h-[var(--table-body,32.5rem)] overflow-auto" @scroll="onScroll">
      <!-- separate borders: a pinned cell paints its background over a collapsed one -->
      <table
        :aria-busy="props.loading"
        :aria-rowcount="ordered.length + 1"
        class="w-full table-fixed border-separate border-spacing-0 text-left"
      >
        <thead class="sticky top-0 z-(--z-sticky)">
          <tr ref="headRow" :aria-rowindex="1" class="bg-raised select-none">
            <th
              scope="col"
              class="reed-edge warp-line-end sticky left-0 z-(--z-pinned) bg-raised px-(--cell-x)"
              :style="{ height: 'var(--row-h)', width: GUTTER }"
            >
              <Checkbox
                :checked="headerState"
                :label="`Select all ${countNoun(props.noun, 2)}`"
                @update:checked="toggleAll"
              />
            </th>
            <th
              v-for="(column, index) in drawn"
              :key="column.key"
              scope="col"
              :aria-sort="ariaSort(column)"
              :data-column="column.key"
              :class="
                cx(
                  'reed-edge px-(--cell-x) font-medium',
                  index === 0 && 'warp-line-end sticky z-(--z-pinned) bg-raised',
                  move !== null && (move.index === index ? CARRIED : SLIDING),
                )
              "
              :style="{
                height: 'var(--row-h)',
                left: index === 0 ? GUTTER : undefined,
                width: widthOf(column),
                translate: move === null ? undefined : `${move.shifts[index]}px`,
              }"
              @pointerdown="index > 0 && startMove($event)"
              @pointermove="index > 0 && trackMove($event, column.key)"
              @pointerup="index > 0 && dropMove()"
              @lostpointercapture="index > 0 && endMove($event, column.key)"
            >
              <Tooltip v-if="column.hint" :content="column.hint">
                <ColumnHead
                  :column="column"
                  :direction="directionOf(column)"
                  @sort="(keyed: boolean) => sortColumn(column.key, keyed)"
                />
              </Tooltip>
              <ColumnHead
                v-else
                :column="column"
                :direction="directionOf(column)"
                @sort="(keyed: boolean) => sortColumn(column.key, keyed)"
              />
              <ColumnGrip
                :label="column.label"
                @resize="(next: number) => resizeColumn(column.key, next)"
                @nudge="(by: number) => nudgeColumn(column.key, by)"
              />
            </th>
            <th scope="col" class="reed-edge">
              <span class="sr-only">Spare width</span>
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-if="props.loading">
            <tr v-for="(id, index) in SKELETON_IDS" :key="id">
              <td
                :colspan="span"
                class="reed-warp reed-warp-beat"
                :style="{ height: 'var(--row-h)', animationDelay: `calc(var(--dur-instant) * ${index})` }"
              />
            </tr>
          </template>

          <tr v-else-if="ordered.length === 0">
            <td :colspan="span" class="border-t border-reed/60 p-0">
              <div class="table-empty">
                <EmptyState :title="props.emptyMessage" />
              </div>
            </td>
          </tr>

          <template v-else>
            <!-- the rows outside the window still take their height, so the scrollbar tells the truth -->
            <tr v-if="view.before > 0" aria-hidden="true">
              <td :colspan="span" :style="{ height: px(view.before), padding: 0, border: 0 }" />
            </tr>

            <tr
              v-for="entry in windowed"
              :key="entry.id"
              :aria-rowindex="entry.position + 2"
              :tabindex="entry.position === stop ? 0 : -1"
              :class="
                cx(
                  'focus-row bg-raised transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:bg-shed data-selected:bg-indigo-wash data-selected:hover:bg-indigo-wash',
                  activates && 'cursor-pointer',
                )
              "
              :data-selected="selected.has(entry.id) ? '' : undefined"
              @keydown="onRowKeyDown($event, entry.id, entry.position, entry.row)"
              @click="onRowClick($event, entry.row)"
            >
              <td
                :class="
                  cx(
                    'selvedge sticky left-0 z-(--z-pinned) border-t border-reed/60',
                    PINNED,
                    selected.has(entry.id) && 'selvedge-on',
                  )
                "
                :style="{ height: 'var(--row-h)' }"
              >
                <Checkbox
                  :checked="selected.has(entry.id)"
                  :label="`Select row ${entry.id}`"
                  @update:checked="toggleRow(entry.id)"
                />
              </td>
              <td
                v-for="(column, index) in drawn"
                :key="column.key"
                :class="
                  cx(
                    'truncate border-t border-reed/60 px-(--cell-x) text-weft-dim',
                    index === 0 && `sticky z-(--z-pinned) ${PINNED}`,
                    index > 1 && 'warp-line',
                    column.numeric && 'tnum text-right font-data text-weft',
                    move !== null && (move.index === index ? CARRIED : SLIDING),
                  )
                "
                :style="{
                  height: 'var(--row-h)',
                  left: index === 0 ? GUTTER : undefined,
                  translate: move === null ? undefined : `${move.shifts[index]}px`,
                }"
              >
                <slot :name="`cell-${column.key}`" :row="entry.row" />
              </td>
              <td class="warp-line border-t border-reed/60" />
            </tr>

            <tr v-if="view.after > 0" aria-hidden="true">
              <td :colspan="span" :style="{ height: px(view.after), padding: 0, border: 0 }" />
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>
</template>
