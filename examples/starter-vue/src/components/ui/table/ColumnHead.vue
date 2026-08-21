<script setup lang="ts" generic="T">
import { computed } from 'vue'
import { cx } from '@/lib/cx'
import type { Column, SortDirection } from '@/components/ui/table/Table.vue'

const props = defineProps<{
  column: Column<T>
  direction?: SortDirection
}>()

const emit = defineEmits<{ sort: [] }>()

const sortable = computed(() => props.column.sortValue !== undefined)

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
    @click="sortable && emit('sort')"
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
