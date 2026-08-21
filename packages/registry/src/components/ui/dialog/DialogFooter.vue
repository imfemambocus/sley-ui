<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <footer
    :class="cx('flex items-center justify-end gap-(--stack) border-t border-reed px-(--cell-x) py-(--stack)', props.class)"
  >
    <slot />
  </footer>
</template>
