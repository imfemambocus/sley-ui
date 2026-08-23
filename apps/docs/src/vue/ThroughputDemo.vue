<script setup lang="ts">
import ThroughputChart from '@demo/vue/ThroughputChart.vue'
import Demo from './Demo.vue'
</script>

<template>
  <Demo
    bleed
    caption="The same thirty days, stacked by assay. The weekends are the floor, and 6 August is the day the methyl run failed."
  >
    <ThroughputChart />
  </Demo>
</template>
