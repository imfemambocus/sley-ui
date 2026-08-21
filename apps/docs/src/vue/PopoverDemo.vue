<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import Popover from '@/components/ui/popover/Popover.vue'
import PopoverContent from '@/components/ui/popover/PopoverContent.vue'
import PopoverTrigger from '@/components/ui/popover/PopoverTrigger.vue'
import Demo from './Demo.vue'

const COLUMNS = ['Run', 'Sample', 'Assay', 'Status', 'Reads', 'Q30']

const hidden = ref<ReadonlySet<string>>(new Set(['Q30']))

const toggle = (key: string) => {
  const next = new Set(hidden.value)
  if (!next.delete(key)) next.add(key)
  hidden.value = next
}
</script>

<template>
  <Demo caption="The column menu from the demo application, which is what this component was built for.">
    <Popover :positioning="{ placement: 'bottom-start' }">
      <PopoverTrigger as-child>
        <Button>
          <span class="inline-flex items-baseline gap-1.5">
            <span>Columns</span>
            <span v-if="hidden.size > 0" class="tnum font-data text-indigo">{{ hidden.size }}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <ul>
          <li v-for="column in COLUMNS" :key="column">
            <Checkbox
              :checked="!hidden.has(column)"
              class="w-full px-(--cell-x) py-1 text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:bg-shed hover:text-weft"
              @update:checked="toggle(column)"
            >
              {{ column }}
            </Checkbox>
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  </Demo>
</template>
