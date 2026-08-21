<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import CommandPalette, { type Command } from '@/components/ui/command-palette/CommandPalette.vue'
import Demo from './Demo.vue'

const COMMANDS: readonly Command[] = [
  { id: 'run-open', group: 'Runs', label: 'Open the newest run', hint: '⏎', run: () => {} },
  { id: 'run-cancel', group: 'Runs', label: 'Cancel the selected runs', run: () => {} },
  { id: 'run-export', group: 'Runs', label: 'Export the selection as CSV', run: () => {} },
  { id: 'filter-running', group: 'Filters', label: 'Show running runs only', run: () => {} },
  { id: 'filter-clear', group: 'Filters', label: 'Clear all filters', run: () => {} },
  { id: 'view-columns', group: 'View', label: 'Show every column', run: () => {} },
  { id: 'view-dense', group: 'View', label: 'Set density to dense', run: () => {} },
]

const open = ref(false)
</script>

<template>
  <Demo caption="Arrow keys move the cursor, Enter commits, Escape leaves. In dense mode the group labels go.">
    <Button @click="open = true">Open the palette</Button>
    <CommandPalette v-model:open="open" :commands="COMMANDS" />
  </Demo>
</template>
