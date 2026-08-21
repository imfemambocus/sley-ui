<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div :class="cx('flex flex-col gap-(--stack) px-(--cell-x) py-4', props.class)">
    <slot />
  </div>
</template>
