<script setup lang="ts">
import ChartStates from '@demo/vue/ChartStates.vue'
import Demo from './Demo.vue'
</script>

<template>
  <Demo
    bleed
    caption="The three states of the same chart. The warp field beats while a fetch is out, and stands still when it comes back with nothing."
  >
    <ChartStates />
  </Demo>
</template>
