<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogClose from '@/components/ui/dialog/DialogClose.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue'
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import type { Run } from '../runs'

const props = defineProps<{ run: Run | null }>()

const emit = defineEmits<{
  close: []
  confirm: [run: Run]
}>()

/* holds the run until the dialog has left the screen */
const shown = ref<Run | null>(props.run)

watch(
  () => props.run,
  (run) => {
    if (run !== null) shown.value = run
  },
)
</script>

<template>
  <Dialog
    v-if="shown"
    :open="props.run !== null"
    role="alertdialog"
    @update:open="
      (open: boolean) => {
        if (!open) emit('close')
      }
    "
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Cancel {{ shown.id }}?</DialogTitle>
        <DialogDescription>
          The instrument stops, and the reads it has written stay on the run.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="quiet">Keep the run</Button>
        </DialogClose>
        <Button variant="danger" @click="emit('confirm', shown)">Cancel the run</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
