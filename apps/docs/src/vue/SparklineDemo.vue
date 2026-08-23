<script setup lang="ts">
import Figure from '@/components/ui/figure/Figure.vue'
import Sparkline from '@/components/ui/sparkline/Sparkline.vue'
import Table, { type Column } from '@/components/ui/table/Table.vue'
import { quality } from '@demo/quality'
import Demo from './Demo.vue'

interface Series {
  readonly assay: string
  readonly q30: readonly number[]
}

const SERIES: readonly Series[] = ['WGS', 'Exome', 'Methyl'].map((assay) => ({
  assay,
  q30: quality.filter((reading) => reading.assay === assay).map((reading) => reading.q30),
}))

/* the y domain of the chart on the chart page, so a row here and a line there agree */
const DOMAIN: readonly [number, number] = [70, 100]

const last = (values: readonly number[]) => values[values.length - 1]

const COLUMNS: readonly Column<Series>[] = [
  { key: 'assay', label: 'Assay', chars: 8, sortValue: (row) => row.assay },
  { key: 'q30', label: 'Q30, 30 days', chars: 18 },
  { key: 'latest', label: 'Latest', unit: '%', chars: 6, numeric: true, sortValue: (row) => last(row.q30) },
]
</script>

<template>
  <Demo
    bleed
    caption="Thirty days of Q30 for each assay, one row each. All three share a domain, so the rows can be read against one another rather than each against itself."
  >
    <Table
      :rows="SERIES"
      :columns="COLUMNS"
      :row-id="(row: Series) => row.assay"
      title="Assays"
      :noun="['assay', 'assays']"
    >
      <template #cell-assay="{ row }">{{ row.assay }}</template>
      <template #cell-q30="{ row }">
        <Sparkline
          :values="row.q30"
          :domain="DOMAIN"
          :label="`${row.assay} ran from ${Math.min(...row.q30)} to ${Math.max(...row.q30)} over thirty days`"
          class="text-indigo"
        />
      </template>
      <template #cell-latest="{ row }">
        <Figure :value="last(row.q30)" :low="last(row.q30) < 80" />
      </template>
    </Table>
  </Demo>
</template>
