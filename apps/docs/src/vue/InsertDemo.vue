<script setup lang="ts">
import { ref } from 'vue'
import InsertChart, { type BaseRange } from '@demo/vue/InsertChart.vue'
import Demo from './Demo.vue'

const range = ref<BaseRange | null>(null)
</script>

<template>
  <Demo
    bleed
    caption="Forty thousand fragments from one prep, binned ten bases at a time. Drag across it to brush a window of lengths, or tab to the plot and move an edge with the arrow keys."
  >
    <InsertChart v-model:range="range" />
  </Demo>
</template>
