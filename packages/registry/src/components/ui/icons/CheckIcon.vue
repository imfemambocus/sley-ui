<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <svg :class="cx('shrink-0', props.class)" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <path d="M3.5 8.5 6.5 11.5 12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="square" />
  </svg>
</template>
