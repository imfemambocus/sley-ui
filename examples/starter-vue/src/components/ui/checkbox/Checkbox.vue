<script lang="ts">
export type CheckedState = boolean | 'indeterminate'
</script>

<script setup lang="ts">
import { Checkbox as ArkCheckbox } from '@ark-ui/vue/checkbox'
import { useSlots, type HTMLAttributes } from 'vue'
import CheckIcon from '@/components/ui/icons/CheckIcon.vue'
import { cx } from '@/lib/cx'

const props = defineProps<{
  /* names a box that shows no text */
  label?: string
  class?: HTMLAttributes['class']
}>()

const checked = defineModel<CheckedState>('checked', { required: true })

const slots = useSlots()

const CONTROL =
  'grid size-(--ctl-box) shrink-0 place-items-center border border-reed-lit text-ground transition-colors duration-(--dur-instant) ease-(--ease-beat) data-[state=checked]:border-indigo data-[state=checked]:bg-indigo data-[state=indeterminate]:border-indigo data-[state=indeterminate]:bg-indigo'
</script>

<!-- the ark root is a label element, so the text inside it toggles the box -->
<template>
  <ArkCheckbox.Root
    v-model:checked="checked"
    :class="cx('ctl-align inline-flex cursor-pointer items-center gap-2', props.class)"
  >
    <ArkCheckbox.Control :class="CONTROL">
      <ArkCheckbox.Indicator>
        <CheckIcon class="size-2.75" />
      </ArkCheckbox.Indicator>
      <ArkCheckbox.Indicator indeterminate>
        <span class="block h-px w-1.75 bg-current" />
      </ArkCheckbox.Indicator>
    </ArkCheckbox.Control>
    <ArkCheckbox.Label v-if="slots.default">
      <slot />
    </ArkCheckbox.Label>
    <ArkCheckbox.HiddenInput :aria-label="slots.default ? undefined : props.label" />
  </ArkCheckbox.Root>
</template>
