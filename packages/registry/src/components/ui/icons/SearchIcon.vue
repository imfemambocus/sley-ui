<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <svg :class="cx('shrink-0', props.class)" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <circle cx="7" cy="7" r="4.25" stroke="currentColor" stroke-width="1.5" />
    <path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
</template>
