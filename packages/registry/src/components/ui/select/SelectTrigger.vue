<script setup lang="ts">
import { Select as ArkSelect } from '@ark-ui/vue/select'
import type { HTMLAttributes } from 'vue'
import ChevronIcon from '@/components/ui/icons/ChevronIcon.vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <ArkSelect.Control>
    <ArkSelect.Trigger :class="cx('ctl h-(--ctl-h) cursor-pointer', props.class)">
      <slot />
      <ChevronIcon class="size-3 text-weft-faint" />
    </ArkSelect.Trigger>
  </ArkSelect.Control>
</template>
