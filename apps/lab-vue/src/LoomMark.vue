<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <svg :class="props.class" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
    <g stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
      <line x1="5" y1="4" x2="5" y2="28" />
      <line x1="12" y1="4" x2="12" y2="28" />
      <line x1="19" y1="4" x2="19" y2="28" />
      <line x1="26" y1="4" x2="26" y2="28" />
      <line x1="3" y1="21.5" x2="29" y2="21.5" />
    </g>
  </svg>
</template>
