<script lang="ts">
export type SortDirection = 'asc' | 'desc'

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
import { computed, ref, shallowRef, watch, watchEffect, type HTMLAttributes } from 'vue'
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
    class?: HTMLAttributes['class']
  }>(),
  { noun: () => 'rows', emptyMessage: 'No row matches the filters.', loading: false },
)

const emit = defineEmits<{ selectionChange: [selected: ReadonlySet<string>] }>()

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

/*
 * the head counts too, because a label and its unit can run longer than the value
 * under it. the half character covers the rounding a table layout applies.
 *
 * the head is drawn in the interface face and the value under it in the data face,
 * so the head takes whichever of the two advances is wider. `1ch` is the interface
 * face's own digit advance, read off this cell. where the data face is the wider of
 * the pair the expression collapses to what it always was.
 */
function intrinsicWidth(column: Column<T>, sorted: boolean) {
  const unit = column.unit ? column.unit.length + 1 : 0
  const head = column.label.length + unit + (sorted ? SORT_CHARS : 0)
  const value = `${column.chars + 0.5} * var(--data-adv)`
  const label = `${head + 0.5} * max(var(--data-adv), 1ch)`
  return `calc(max(${value}, ${label}) + var(--cell-x) * 2)`
}

/* a css length needs its unit; vue writes a bare number as it stands */
const px = (value: string | number) => (typeof value === 'number' ? `${value}px` : value)

const selected = shallowRef<ReadonlySet<string>>(new Set())
/* only a dragged column holds a px width; the rest follow the density */
const widths = ref<Record<string, number | undefined>>({})
const sort = shallowRef<{ key: string; direction: SortDirection } | null>(null)
const cursor = ref<string | null>(null)

/* raised by a key press, so the focus chase below ignores a scroll the pointer made */
let chasing = false

const span = computed(() => props.columns.length + 2)

const resizeColumn = (key: string, next: number) => {
  widths.value = { ...widths.value, [key]: clampWidth(next) }
}

/* third click restores the order the rows arrived in */
const toggleSort = (key: string) => {
  const current = sort.value
  if (current?.key !== key) {
    sort.value = { key, direction: 'asc' }
    return
  }
  sort.value = current.direction === 'asc' ? { key, direction: 'desc' } : null
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

const onRowKeyDown = (event: KeyboardEvent, id: string, position: number) => {
  /* a key pressed on the checkbox inside the row belongs to the checkbox */
  if (event.target !== event.currentTarget) return

  if (event.key === ' ') {
    event.preventDefault()
    toggleRow(id)
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
              v-for="(column, index) in props.columns"
              :key="column.key"
              scope="col"
              :aria-sort="ariaSort(column)"
              :class="
                cx('reed-edge px-(--cell-x) font-medium', index === 0 && 'warp-line-end sticky z-(--z-pinned) bg-raised')
              "
              :style="{
                height: 'var(--row-h)',
                left: index === 0 ? GUTTER : undefined,
                width: px(widths[column.key] ?? intrinsicWidth(column, sort?.key === column.key)),
              }"
            >
              <Tooltip v-if="column.hint" :content="column.hint">
                <ColumnHead :column="column" :direction="directionOf(column)" @sort="toggleSort(column.key)" />
              </Tooltip>
              <ColumnHead v-else :column="column" :direction="directionOf(column)" @sort="toggleSort(column.key)" />
              <ColumnGrip :label="column.label" @resize="(next: number) => resizeColumn(column.key, next)" />
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
              <EmptyState :title="props.emptyMessage" />
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
              class="focus-row bg-raised transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:bg-shed data-selected:bg-indigo-wash data-selected:hover:bg-indigo-wash"
              :data-selected="selected.has(entry.id) ? '' : undefined"
              @keydown="onRowKeyDown($event, entry.id, entry.position)"
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
                v-for="(column, index) in props.columns"
                :key="column.key"
                :class="
                  cx(
                    'truncate border-t border-reed/60 px-(--cell-x) text-weft-dim',
                    index === 0 && `sticky z-(--z-pinned) ${PINNED}`,
                    index > 1 && 'warp-line',
                    column.numeric && 'tnum text-right font-data text-weft',
                  )
                "
                :style="{ height: 'var(--row-h)', left: index === 0 ? GUTTER : undefined }"
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
