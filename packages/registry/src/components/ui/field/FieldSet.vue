<script setup lang="ts">
import { Fieldset } from '@ark-ui/vue/fieldset'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{
  legend: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <Fieldset.Root :disabled="props.disabled" :class="cx('flex flex-col gap-(--stack)', props.class)">
    <Fieldset.Legend class="reed-edge w-full pb-(--stack) font-medium">{{ props.legend }}</Fieldset.Legend>
    <slot />
  </Fieldset.Root>
</template>
