<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import RunTable from '@demo/vue/RunTable.vue'
import { RUN_COLUMNS } from '@demo/vue/columns'
import { longRuns, runs, type Run } from '@demo/runs'
import Demo from './Demo.vue'

const SHORT = runs.slice(0, 9)
const LONG_ROWS = 5000
const LOAD_MS = 450

const loading = ref(false)
const long = ref(false)
const rows = ref<readonly Run[]>(SHORT)

const columns = computed(() => RUN_COLUMNS)

/* the batch is built in memory, and the pause stands in for the fetch a real application makes */
const toggleLong = () => {
  const next = !long.value
  long.value = next
  loading.value = true
  window.setTimeout(() => {
    rows.value = next ? longRuns(LONG_ROWS) : SHORT
    loading.value = false
  }, LOAD_MS)
}
</script>

<template>
  <Demo
    bleed
    caption="Drag a divider to resize. Click a head to sort, three times to get the original order back. At 5000 rows the body holds about 30 of them and the rest is spacer height."
  >
    <RunTable :rows="rows" :columns="columns" :loading="loading">
      <template #actions>
        <Button @click="toggleLong">
          {{ long ? `Back to ${SHORT.length} rows` : `Load ${LONG_ROWS} rows` }}
        </Button>
        <Button @click="loading = !loading">
          {{ loading ? 'Show the rows' : 'Show the loading state' }}
        </Button>
      </template>
    </RunTable>
  </Demo>
</template>
