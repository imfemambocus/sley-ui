<script setup lang="ts">
import { ref } from 'vue'
import FilterBar from '@/components/ui/filter-bar/FilterBar.vue'
import { RUN_GROUPS, type FilterValues } from '@demo/filters'
import Demo from './Demo.vue'

const query = ref('')
const values = ref<FilterValues>({ status: ['running', 'failed'] })
</script>

<template>
  <Demo caption="Two filters are already on. The chips below the row are how you take one off.">
    <FilterBar
      v-model:query="query"
      v-model:values="values"
      class="w-full"
      :groups="RUN_GROUPS"
      search-label="Search runs"
      placeholder="Search runs, samples, owners"
    />
  </Demo>
</template>
