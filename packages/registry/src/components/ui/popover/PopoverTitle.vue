<script setup lang="ts">
import { Popover as ArkPopover } from '@ark-ui/vue/popover'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <ArkPopover.Title :class="cx('reed-edge px-(--cell-x) pt-1 pb-(--stack) font-medium', props.class)">
    <slot />
  </ArkPopover.Title>
</template>
