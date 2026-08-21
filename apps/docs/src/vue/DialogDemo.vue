<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogBody from '@/components/ui/dialog/DialogBody.vue'
import DialogClose from '@/components/ui/dialog/DialogClose.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue'
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import Demo from './Demo.vue'

const open = ref(false)
</script>

<template>
  <Demo caption="Watch it leave. The exit runs on --ease-exit and is shorter than the entry.">
    <Button variant="danger" @click="open = true">Cancel R-4819</Button>
    <Dialog v-model:open="open" role="alertdialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel R-4819?</DialogTitle>
          <DialogDescription>
            The instrument stops, and the reads it has written stay on the run.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p class="text-weft-dim">61.2M reads are on disk. They are kept whatever you choose here.</p>
        </DialogBody>
        <DialogFooter>
          <DialogClose as-child>
            <Button variant="quiet">Keep the run</Button>
          </DialogClose>
          <Button variant="danger" @click="open = false">Cancel the run</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Demo>
</template>
