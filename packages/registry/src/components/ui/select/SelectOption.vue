<script lang="ts">
export interface SelectOptionItem {
  readonly label: string
  readonly value: string
}
</script>

<script setup lang="ts">
import { Select as ArkSelect } from '@ark-ui/vue/select'
import type { HTMLAttributes } from 'vue'
import CheckIcon from '@/components/ui/icons/CheckIcon.vue'
import { cx } from '@/lib/cx'

const props = defineProps<{
  item: SelectOptionItem
  class?: HTMLAttributes['class']
}>()
</script>

<!-- the shed follows the keyboard, the selvedge marks the choice -->
<template>
  <ArkSelect.Item
    :item="props.item"
    :class="
      cx(
        'selvedge flex cursor-pointer items-center justify-between gap-3 px-(--cell-x) py-1 text-weft-dim data-highlighted:bg-shed data-highlighted:text-weft data-[state=checked]:bg-indigo-wash data-[state=checked]:text-weft data-[state=checked]:selvedge-on',
        props.class,
      )
    "
  >
    <ArkSelect.ItemText>{{ props.item.label }}</ArkSelect.ItemText>
    <ArkSelect.ItemIndicator>
      <CheckIcon class="size-3 text-indigo" />
    </ArkSelect.ItemIndicator>
  </ArkSelect.Item>
</template>
