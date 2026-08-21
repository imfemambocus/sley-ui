<script setup lang="ts">
import { Field as ArkField } from '@ark-ui/vue/field'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <ArkField.Root :class="cx('flex flex-col gap-1', props.class)">
    <slot />
  </ArkField.Root>
</template>
