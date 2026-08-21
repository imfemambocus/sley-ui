<script setup lang="ts">
import TraceChart from '@demo/vue/TraceChart.vue'
import Demo from './Demo.vue'
</script>

<template>
  <Demo
    bleed
    caption="One flow cell, one reading a second for fourteen hours. The header control switches between the thousand points the frame can resolve and all 50,400 of them."
  >
    <TraceChart />
  </Demo>
</template>
