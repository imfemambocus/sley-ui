<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <svg :class="cx('shrink-0', props.class)" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <path d="m4 6.5 4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
