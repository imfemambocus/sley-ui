<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import FilterBar, { type FilterGroup, type FilterValues } from '@/components/ui/filter-bar/FilterBar.vue'
import Table, { type Column } from '@/components/ui/table/Table.vue'
import { ASSAYS, runs, STATUSES, type Run } from './data/runs'

const DENSITIES = ['comfortable', 'compact', 'dense'] as const
type Density = (typeof DENSITIES)[number]

const TONE: Record<Run['status'], string> = {
  complete: 'text-jade',
  running: 'text-indigo',
  queued: 'text-weft-dim',
  failed: 'text-madder',
}

/* the group carries how to read its own value off a row, so the filter needs no cast */
interface RunFilter extends FilterGroup {
  readonly pick: (run: Run) => string
}

const GROUPS: readonly RunFilter[] = [
  { key: 'assay', label: 'Assay', options: [...ASSAYS], pick: (run) => run.assay },
  { key: 'status', label: 'Status', options: [...STATUSES], pick: (run) => run.status },
]

/* the cell markup lives in a slot below, so a column is data and nothing else */
const COLUMNS: readonly Column<Run>[] = [
  { key: 'id', label: 'Run', chars: 8, sortValue: (r) => r.id },
  { key: 'sample', label: 'Sample', chars: 12, sortValue: (r) => r.sample },
  { key: 'assay', label: 'Assay', chars: 9, sortValue: (r) => r.assay },
  { key: 'status', label: 'Status', chars: 10, sortValue: (r) => r.status },
  { key: 'reads', label: 'Reads', unit: 'M', chars: 7, numeric: true, sortValue: (r) => r.reads },
  { key: 'q30', label: 'Q30', unit: '%', chars: 6, numeric: true, sortValue: (r) => r.q30 },
  { key: 'owner', label: 'Owner', chars: 12, sortValue: (r) => r.owner },
]

const density = ref<Density>('comfortable')
const query = ref('')
const values = ref<FilterValues>({})

/* the density tokens are declared on :root, so the attribute belongs on the html element */
watch(density, (next) => {
  document.documentElement.dataset.density = next
}, { immediate: true })

const shown = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return runs.filter((run) => {
    for (const group of GROUPS) {
      const chosen = values.value[group.key]
      if (chosen?.length && !chosen.includes(group.pick(run))) return false
    }
    if (!needle) return true
    return `${run.id} ${run.sample} ${run.owner}`.toLowerCase().includes(needle)
  })
})

/* the integer reads first, so the digits after the point step back */
const split = (value: number, places = 1) => {
  const [whole, fraction] = value.toFixed(places).split('.')
  return { whole, fraction }
}
</script>

<template>
  <div class="min-h-dvh bg-ground text-weft">
    <div class="mx-auto flex max-w-6xl flex-col gap-(--stack) p-6">
      <header class="flex flex-wrap items-baseline justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h1 class="font-ui text-[22px] font-semibold tracking-[-0.02em]">Sequencing runs</h1>
          <p class="text-weft-dim">
            Every control below reads the density. Change it and nothing goes out of step.
          </p>
        </div>
        <div class="flex gap-2">
          <Button
            v-for="option in DENSITIES"
            :key="option"
            :variant="option === density ? 'primary' : 'default'"
            @click="density = option"
          >
            {{ option }}
          </Button>
        </div>
      </header>

      <FilterBar
        v-model:query="query"
        v-model:values="values"
        :groups="GROUPS"
        placeholder="Search a run, a sample or an owner"
      />

      <Table
        :rows="shown"
        :columns="COLUMNS"
        :row-id="(run: Run) => run.id"
        title="Runs"
        :noun="['run', 'runs']"
        empty-message="No run matches that filter."
      >
        <template #cell-id="{ row }">
          <span class="font-data">{{ row.id }}</span>
        </template>
        <template #cell-sample="{ row }">
          <span class="font-data">{{ row.sample }}</span>
        </template>
        <template #cell-assay="{ row }">{{ row.assay }}</template>
        <template #cell-status="{ row }">
          <span :class="`ctl-align inline-flex items-center gap-2 ${TONE[row.status]}`">
            <span :class="`size-1.25 rounded-full bg-current ${row.status === 'running' ? 'beat' : ''}`" />
            <span class="font-data">{{ row.status }}</span>
          </span>
        </template>
        <template #cell-reads="{ row }">
          <span v-if="row.reads === 0" class="reed-mark" aria-label="no value" />
          <span v-else class="tnum font-data"
            >{{ split(row.reads).whole }}<span class="text-weft-faint">.{{ split(row.reads).fraction }}</span></span
          >
        </template>
        <template #cell-q30="{ row }">
          <span v-if="row.q30 === 0" class="reed-mark" aria-label="no value" />
          <span v-else class="tnum font-data"
            >{{ split(row.q30).whole }}<span class="text-weft-faint">.{{ split(row.q30).fraction }}</span></span
          >
        </template>
        <template #cell-owner="{ row }">{{ row.owner }}</template>
      </Table>
    </div>
  </div>
</template>
