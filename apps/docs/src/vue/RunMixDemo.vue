<script setup lang="ts">
import RunMixChart from '@demo/vue/RunMixChart.vue'
import Demo from './Demo.vue'
</script>

<template>
  <Demo
    bleed
    caption="The 27 runs the table holds, counted by assay and stacked by status. A band scale has no inverse, so this one takes no brush."
  >
    <RunMixChart />
  </Demo>
</template>
