<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
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
import { STATUSES, runs, type Run } from '@demo/runs'
import { STATUS_TONE } from '@demo/status'

const query = ref('')
const values = ref<FilterValues>({})
const loading = ref(false)
const detail = ref<Run | null>(null)
const pending = ref<Run | null>(null)
const hidden = ref<ReadonlySet<string>>(new Set())
const selected = ref<ReadonlySet<string>>(new Set())
const range = ref<DayRange | null>(null)

const visible = computed(() =>
  runs.filter((run) => matchesFilters(run, query.value, values.value) && withinRange(run.started, range.value)),
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

const tally = computed(() =>
  STATUSES.map((status) => ({
    status,
    tone: STATUS_TONE[status],
    count: visible.value.filter((run) => run.status === status).length,
  })),
)
</script>

<template>
  <div class="flex flex-col gap-(--stack)">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <dl class="flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <div v-for="entry in tally" :key="entry.status" class="flex items-baseline gap-1.5">
          <span :class="`size-1.25 translate-y-[-2px] rounded-full bg-current ${entry.tone}`" />
          <dt class="text-weft-dim">{{ entry.status }}</dt>
          <dd class="tnum font-data text-weft">{{ entry.count }}</dd>
        </div>
      </dl>
      <Button variant="quiet" @click="loading = !loading">
        {{ loading ? 'Show the rows' : 'Show the loading state' }}
      </Button>
    </div>

    <QualityChart v-model:range="range" />

    <FilterBar
      v-model:query="query"
      v-model:values="values"
      :groups="RUN_GROUPS"
      search-label="Search runs"
      placeholder="Search runs, samples, owners"
    />

    <RunTable
      :rows="visible"
      :columns="columns"
      :loading="loading"
      empty-message="No run is left inside the filters and the brushed range."
      @open="detail = $event"
      @selection-change="selected = $event"
    >
      <template #actions>
        <Button v-if="exportable > 0" @click="exportRuns">Export</Button>
        <ColumnMenu :columns="RUN_COLUMNS" :hidden="hidden" @toggle="toggleColumn" />
      </template>
    </RunTable>

    <RunPanel :run="detail" @close="detail = null" @cancel-run="pending = $event" />
    <CancelDialog :run="pending" @close="pending = null" @confirm="cancelRun" />
    <Toaster :toaster="toaster" />
  </div>
</template>
