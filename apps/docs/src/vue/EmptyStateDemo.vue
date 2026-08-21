<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import EmptyState from '@/components/ui/empty-state/EmptyState.vue'
import Demo from './Demo.vue'
</script>

<template>
  <Demo bleed caption="The loom threaded and standing still. The loading state is the same field, moving.">
    <EmptyState title="No metrics yet" description="The run has produced no reads.">
      <template #action>
        <Button variant="quiet">Tell me when it starts</Button>
      </template>
    </EmptyState>
  </Demo>
</template>
