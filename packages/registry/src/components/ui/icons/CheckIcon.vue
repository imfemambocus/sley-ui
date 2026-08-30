<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <svg :class="cx('shrink-0', props.class)" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <path d="M3.25 8.25 6.5 11.5 12.75 5.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" />
  </svg>
</template>
