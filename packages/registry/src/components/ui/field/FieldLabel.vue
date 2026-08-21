<script setup lang="ts">
import { Field as ArkField } from '@ark-ui/vue/field'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <ArkField.Label :class="cx('flex items-center gap-1 text-weft-dim', props.class)">
    <slot />
    <ArkField.RequiredIndicator class="text-weft-faint" />
  </ArkField.Label>
</template>
