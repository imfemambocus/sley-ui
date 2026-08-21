<script setup lang="ts">
import { Popover as ArkPopover } from '@ark-ui/vue/popover'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <ArkPopover.Description :class="cx('px-(--cell-x) py-1 text-weft-dim', props.class)">
    <slot />
  </ArkPopover.Description>
</template>
