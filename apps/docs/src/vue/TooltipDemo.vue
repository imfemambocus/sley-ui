<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Tooltip from '@/components/ui/tooltip/Tooltip.vue'
import Demo from './Demo.vue'
</script>

<template>
  <Demo caption="200ms to open and 80ms to close, which is faster than the Ark default.">
    <Tooltip content="The share of bases called with a quality of 30 or better.">
      <Button variant="quiet">Q30</Button>
    </Tooltip>
    <Tooltip content="Millions of reads that passed the chastity filter.">
      <Button variant="quiet">Reads</Button>
    </Tooltip>
  </Demo>
</template>
