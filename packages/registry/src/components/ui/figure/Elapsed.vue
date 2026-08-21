<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const props = defineProps<{
  minutes: number
  class?: HTMLAttributes['class']
}>()
</script>

<!-- a head cannot hold two units, so a duration carries them in the cell -->
<template>
  <span :class="props.class"
    >{{ Math.trunc(props.minutes / 60) }}<span class="text-weft-faint">h </span
    >{{ String(props.minutes % 60).padStart(2, '0') }}<span class="text-weft-faint">m</span></span
  >
</template>
