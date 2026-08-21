<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Toaster from '@/components/ui/toast/Toaster.vue'
import { toaster } from '@demo/vue/toaster'
import Demo from './Demo.vue'
</script>

<template>
  <Demo caption="Raise a few at once. They stack, and the group holds the highest rank in the document.">
    <Button
      @click="
        toaster.create({
          title: '12 runs are queued for export',
          description: 'A link follows when the archive is written.',
          type: 'success',
        })
      "
    >
      Success
    </Button>
    <Button @click="toaster.create({ title: 'R-4818 failed on the flow cell', type: 'error' })">Error</Button>
    <Button
      @click="
        toaster.create({
          title: 'R-4819 is cancelled',
          description: 'The instrument has stopped, and the reads stay on the run.',
          type: 'warning',
        })
      "
    >
      Warning
    </Button>
    <Button @click="toaster.create({ title: 'Watching R-4814', type: 'info' })">Info</Button>
    <Button @click="toaster.create({ title: 'Writing the archive', type: 'loading' })">Loading</Button>
    <Toaster :toaster="toaster" />
  </Demo>
</template>
