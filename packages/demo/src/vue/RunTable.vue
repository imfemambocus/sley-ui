<script setup lang="ts">
import Elapsed from '@/components/ui/figure/Elapsed.vue'
import Figure from '@/components/ui/figure/Figure.vue'
import Table, { type Column } from '@/components/ui/table/Table.vue'
import { stamp } from '../format'
import type { Run } from '../runs'
import { STATUS_TONE } from '../status'
import { Q30_FLOOR } from './columns'

const props = withDefaults(
  defineProps<{
    rows: readonly Run[]
    columns: readonly Column<Run>[]
    loading?: boolean
    emptyMessage?: string
  }>(),
  { loading: false, emptyMessage: 'No run matches the filters.' },
)

const emit = defineEmits<{
  open: [run: Run]
  selectionChange: [selected: ReadonlySet<string>]
}>()
</script>

<template>
  <Table
    :rows="props.rows"
    :columns="props.columns"
    :row-id="(run: Run) => run.id"
    title="Sequencing runs"
    :noun="['run', 'runs']"
    :empty-message="props.emptyMessage"
    :loading="props.loading"
    @selection-change="(selected) => emit('selectionChange', selected)"
    @row-activate="(row) => emit('open', row)"
  >
    <template #actions>
      <slot name="actions" />
    </template>

    <template #cell-id="{ row }">
      <button
        type="button"
        class="cursor-pointer font-data text-weft transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-indigo"
        @click="emit('open', row)"
      >
        {{ row.id }}
      </button>
    </template>

    <template #cell-sample="{ row }">
      <span class="font-data" :title="row.sample">{{ row.sample }}</span>
    </template>

    <template #cell-assay="{ row }">
      <span class="font-data">{{ row.assay }}</span>
    </template>

    <template #cell-status="{ row }">
      <span :class="`inline-flex items-center gap-1.5 ${STATUS_TONE[row.status]}`">
        <span :class="`size-1.25 rounded-full bg-current ${row.status === 'running' ? 'beat' : ''}`" />
        <span class="font-data">{{ row.status }}</span>
      </span>
    </template>

    <template #cell-reads="{ row }">
      <Figure :value="row.reads" />
    </template>

    <template #cell-q30="{ row }">
      <Figure :value="row.q30" :low="row.q30 > 0 && row.q30 < Q30_FLOOR" />
    </template>

    <template #cell-coverage="{ row }">
      <Figure :value="row.coverage" />
    </template>

    <template #cell-started="{ row }">
      <span class="font-data">{{ stamp(row.started).short }}</span>
    </template>

    <template #cell-duration="{ row }">
      <Elapsed :minutes="row.duration" />
    </template>

    <template #cell-owner="{ row }">{{ row.owner }}</template>
  </Table>
</template>
