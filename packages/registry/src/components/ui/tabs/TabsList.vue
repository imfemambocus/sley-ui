<script setup lang="ts">
import { Tabs as ArkTabs } from '@ark-ui/vue/tabs'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<!-- ark moves the mark between tabs, and the list is the frame it is placed against -->
<template>
  <ArkTabs.List :class="cx('relative flex items-center border-b border-reed', props.class)">
    <slot />
    <ArkTabs.Indicator class="selvedge selvedge-bottom selvedge-on tab-mark bottom-0 h-0.5 w-(--width)" />
  </ArkTabs.List>
</template>
