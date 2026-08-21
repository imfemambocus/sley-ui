<script setup lang="ts">
import { Tabs as ArkTabs } from '@ark-ui/vue/tabs'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{
  value: string
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <ArkTabs.Content :value="props.value" :class="cx('py-(--stack) focus:outline-none', props.class)">
    <slot />
  </ArkTabs.Content>
</template>
