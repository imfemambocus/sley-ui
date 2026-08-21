<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import Popover from '@/components/ui/popover/Popover.vue'
import PopoverContent from '@/components/ui/popover/PopoverContent.vue'
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue'
import type { Column } from '@/components/ui/table/Table.vue'
import type { Run } from '../runs'

const props = defineProps<{
  columns: readonly Column<Run>[]
  hidden: ReadonlySet<string>
}>()

const emit = defineEmits<{ toggle: [key: string] }>()
</script>

<template>
  <Popover :positioning="{ placement: 'bottom-end' }">
    <PopoverTrigger as-child>
      <Button>
        <span class="inline-flex items-baseline gap-1.5">
          <span>Columns</span>
          <span v-if="props.hidden.size > 0" class="tnum font-data text-indigo">{{ props.hidden.size }}</span>
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent>
      <ul>
        <li v-for="column in props.columns" :key="column.key">
          <Checkbox
            :checked="!props.hidden.has(column.key)"
            class="w-full px-(--cell-x) py-1 text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:bg-shed hover:text-weft"
            @update:checked="emit('toggle', column.key)"
          >
            {{ column.label }}
          </Checkbox>
        </li>
      </ul>
    </PopoverContent>
  </Popover>
</template>
