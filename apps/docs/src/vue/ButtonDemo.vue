<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Demo from './Demo.vue'
</script>

<template>
  <Demo caption="Four variants, one height token. Move the density and every one follows.">
    <Button>Export</Button>
    <Button variant="primary">Save</Button>
    <Button variant="danger">Cancel the run</Button>
    <Button variant="quiet">Dismiss</Button>
    <Button disabled>Unavailable</Button>
  </Demo>
</template>
