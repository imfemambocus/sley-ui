<script setup lang="ts" generic="T">
import { computed } from 'vue'
import { cx } from '@/lib/cx'
import type { Column, SortDirection } from '@/components/ui/table/Table.vue'

const props = defineProps<{
  column: Column<T>
  direction?: SortDirection
}>()

/* a key press reports no click count, and the table sorts on that one whatever a drag did */
const emit = defineEmits<{ sort: [keyed: boolean] }>()

const sortable = computed(() => props.column.sortValue !== undefined)

const onClick = (event: MouseEvent) => {
  if (sortable.value) emit('sort', event.detail === 0)
}

const shell = computed(() =>
  cx(
    'flex h-full w-full items-center gap-1.5 text-weft-dim',
    props.column.numeric && 'justify-end',
    sortable.value && 'cursor-pointer transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft',
  ),
)
</script>

<template>
  <component
    :is="sortable ? 'button' : 'div'"
    :type="sortable ? 'button' : undefined"
    :class="shell"
    @click="onClick"
  >
    <!-- the mark sits inside the baseline group, standing on the baseline of the label -->
    <span class="inline-flex min-w-0 items-baseline gap-1.5">
      <span class="truncate">{{ props.column.label }}</span>
      <span v-if="props.column.unit" class="font-data text-weft-faint">{{ props.column.unit }}</span>
      <span
        v-if="props.direction"
        :class="cx('reed-sort text-indigo', props.direction === 'desc' && 'reed-sort-down')"
        aria-hidden="true"
      />
    </span>
  </component>
</template>
