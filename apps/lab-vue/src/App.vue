<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import CommandPalette, { type Command } from '@/components/ui/command-palette/CommandPalette.vue'
import FilterBar from '@/components/ui/filter-bar/FilterBar.vue'
import Toaster from '@/components/ui/toast/Toaster.vue'
import CancelDialog from '@demo/vue/CancelDialog.vue'
import ColumnMenu from '@demo/vue/ColumnMenu.vue'
import QualityChart, { type DayRange } from '@demo/vue/QualityChart.vue'
import RunPanel from '@demo/vue/RunPanel.vue'
import RunTable from '@demo/vue/RunTable.vue'
import { RUN_COLUMNS } from '@demo/vue/columns'
import { toaster } from '@demo/vue/toaster'
import { RUN_GROUPS, matchesFilters, type FilterValues } from '@demo/filters'
import { withinRange } from '@demo/quality'
import { longRuns, runs, type Run } from '@demo/runs'
import LoomMark from './LoomMark.vue'
import Segmented from './Segmented.vue'

const DENSITIES = ['comfortable', 'compact', 'dense'] as const
type Density = (typeof DENSITIES)[number]

const THEMES = ['dark', 'light'] as const
type Theme = (typeof THEMES)[number]

const KNOBS = ['--row-h', '--cell-x', '--ui-text', '--ctl-h', '--stack', '--reed-pitch'] as const

const LONG_ROWS = 1000
const LOAD_MS = 450

const density = ref<Density>('compact')
const theme = ref<Theme>('dark')
const query = ref('')
const values = ref<FilterValues>({})
const paletteOpen = ref(false)
const loading = ref(false)
const long = ref(false)
const source = ref<readonly Run[]>(runs)
const knobs = ref<readonly { name: string; value: string }[]>([])
const detail = ref<Run | null>(null)
const pending = ref<Run | null>(null)
const hidden = ref<ReadonlySet<string>>(new Set())
const selected = ref<ReadonlySet<string>>(new Set())
const range = ref<DayRange | null>(null)

/*
 * the cross fade needs the new palette in the dom inside its callback, so the update is
 * flushed there. reduced motion sets the duration to 0ms and takes the plain path, which
 * spares the snapshot. a browser with no view transitions swaps.
 */
const changeTheme = (next: Theme) => {
  const fade = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-overlay'))
  if (fade === 0 || !document.startViewTransition) {
    theme.value = next
    return
  }
  document.startViewTransition(() => {
    theme.value = next
    return nextTick()
  })
}

watch(
  [density, theme],
  () => {
    const root = document.documentElement
    root.dataset.density = density.value
    root.dataset.theme = theme.value
    const style = getComputedStyle(root)
    knobs.value = KNOBS.map((token) => ({ name: token.slice(2), value: style.getPropertyValue(token).trim() }))
  },
  { immediate: true },
)

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key.toLowerCase() !== 'k') return
  if (!event.metaKey && !event.ctrlKey) return
  event.preventDefault()
  paletteOpen.value = !paletteOpen.value
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

/* the batch is built in memory, and the pause stands in for the fetch a real application makes */
const toggleLong = () => {
  const next = !long.value
  long.value = next
  loading.value = true
  window.setTimeout(() => {
    source.value = next ? longRuns(LONG_ROWS) : runs
    loading.value = false
  }, LOAD_MS)
}

const visible = computed(() =>
  source.value.filter((run) => matchesFilters(run, query.value, values.value) && withinRange(run.started, range.value)),
)

const exportable = computed(() => visible.value.filter((run) => selected.value.has(run.id)).length)

const columns = computed(() => RUN_COLUMNS.filter((column) => !hidden.value.has(column.key)))

const toggleColumn = (key: string) => {
  const next = new Set(hidden.value)
  if (!next.delete(key)) next.add(key)
  hidden.value = next
}

const cancelRun = (run: Run) => {
  pending.value = null
  detail.value = null
  toaster.create({
    title: `${run.id} is cancelled`,
    description: 'The instrument has stopped, and the reads stay on the run.',
    type: 'warning',
  })
}

const exportRuns = () =>
  toaster.create({
    title: `${exportable.value} ${exportable.value === 1 ? 'run is' : 'runs are'} queued for export`,
    type: 'success',
  })

const commands = computed<readonly Command[]>(() => [
  ...DENSITIES.map((option) => ({
    id: `density-${option}`,
    group: 'Density',
    label: `Set density to ${option}`,
    run: () => {
      density.value = option
    },
  })),
  ...THEMES.map((option) => ({
    id: `theme-${option}`,
    group: 'Appearance',
    label: `Switch to ${option}`,
    run: () => changeTheme(option),
  })),
  {
    id: 'filter-running',
    group: 'Filters',
    label: 'Show running runs only',
    run: () => {
      values.value = { status: ['running'] }
    },
  },
  {
    id: 'filter-failed',
    group: 'Filters',
    label: 'Show failed runs only',
    run: () => {
      values.value = { status: ['failed'] }
    },
  },
  {
    id: 'filter-clear',
    group: 'Filters',
    label: 'Clear all filters',
    run: () => {
      values.value = {}
    },
  },
  {
    id: 'table-loading',
    group: 'Table',
    label: 'Toggle the loading state',
    run: () => {
      loading.value = !loading.value
    },
  },
  { id: 'table-long', group: 'Table', label: `Toggle ${LONG_ROWS} rows`, run: toggleLong },
  {
    id: 'table-columns',
    group: 'Table',
    label: 'Show every column',
    run: () => {
      hidden.value = new Set()
    },
  },
  {
    id: 'run-open',
    group: 'Runs',
    label: 'Open the newest run',
    run: () => {
      detail.value = runs[0]
    },
  },
])
</script>

<template>
  <div class="min-h-dvh px-6 py-8">
    <div class="mx-auto flex max-w-295 flex-col gap-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <LoomMark class="size-7 shrink-0 -translate-y-[0.75px] text-indigo" />
            <div class="flex items-baseline gap-3">
              <p class="font-ui text-[34px] leading-none font-bold tracking-[-0.045em]">sley</p>
              <p class="font-data text-[19px] leading-none text-weft-dim">lab</p>
            </div>
          </div>
          <p class="mt-2.5 text-weft-dim">Components for interfaces that hold a lot of data.</p>
        </div>

        <div class="flex flex-wrap items-center gap-(--stack)">
          <ul class="tnum flex flex-wrap items-center gap-x-3 gap-y-1 font-data text-weft-faint">
            <li v-for="knob in knobs" :key="knob.name">
              {{ knob.name }} <span class="text-weft-dim">{{ knob.value }}</span>
            </li>
          </ul>
          <Segmented legend="Density" :options="DENSITIES" :value="density" @select="density = $event" />
          <Segmented legend="Appearance" :options="THEMES" :value="theme" @select="changeTheme" />
          <Button @click="paletteOpen = true">
            <span>Commands</span>
            <kbd class="font-data text-[11px] text-weft-faint">⌘K</kbd>
          </Button>
        </div>
      </header>

      <FilterBar
        v-model:query="query"
        v-model:values="values"
        :groups="RUN_GROUPS"
        search-label="Search runs"
        placeholder="Search runs, samples, owners"
      />

      <QualityChart v-model:range="range" />

      <RunTable
        :rows="visible"
        :columns="columns"
        :loading="loading"
        @open="detail = $event"
        @selection-change="selected = $event"
      >
        <template #actions>
          <Button v-if="exportable > 0" @click="exportRuns">Export</Button>
          <ColumnMenu :columns="RUN_COLUMNS" :hidden="hidden" @toggle="toggleColumn" />
        </template>
      </RunTable>
    </div>

    <RunPanel :run="detail" @close="detail = null" @cancel-run="pending = $event" />
    <CancelDialog :run="pending" @close="pending = null" @confirm="cancelRun" />
    <CommandPalette v-model:open="paletteOpen" :commands="commands" />
    <Toaster :toaster="toaster" />
  </div>
</template>
