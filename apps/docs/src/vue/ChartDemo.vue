<script setup lang="ts">
import { ref } from 'vue'
import QualityChart, { type DayRange } from '@demo/vue/QualityChart.vue'
import Demo from './Demo.vue'

const range = ref<DayRange | null>(null)
</script>

<template>
  <Demo
    bleed
    caption="Q30 by assay over 30 days. Drag across it to brush a range, or tab to the plot and move an edge with the arrow keys. A click or Escape clears. The madder rule is the quality floor the table draws its reed under."
  >
    <QualityChart v-model:range="range" />
  </Demo>
</template>
