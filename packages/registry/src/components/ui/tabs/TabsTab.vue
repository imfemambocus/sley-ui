<script setup lang="ts">
import { Tabs as ArkTabs } from '@ark-ui/vue/tabs'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{
  value: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <ArkTabs.Trigger
    :value="props.value"
    :disabled="props.disabled"
    :class="
      cx(
        'h-(--ctl-h) cursor-pointer px-(--cell-x) text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:bg-shed hover:text-weft data-selected:text-weft disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  >
    <slot />
  </ArkTabs.Trigger>
</template>
