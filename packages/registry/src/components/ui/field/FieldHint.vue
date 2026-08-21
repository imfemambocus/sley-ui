<script setup lang="ts">
import { Field as ArkField } from '@ark-ui/vue/field'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <ArkField.HelperText :class="cx('text-weft-faint dense:sr-only', props.class)">
    <slot />
  </ArkField.HelperText>
</template>
