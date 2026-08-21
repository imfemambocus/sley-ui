<script setup lang="ts">
import { Dialog as ArkDialog } from '@ark-ui/vue/dialog'

/* ark removes the node when the exit animation ends. both mount options default on. */
const props = withDefaults(
  defineProps<{
    unmountOnExit?: boolean
    lazyMount?: boolean
  }>(),
  { unmountOnExit: true, lazyMount: true },
)
</script>

<!-- `v-model:open` and `role`: attributes, forwarded -->
<template>
  <ArkDialog.Root :unmount-on-exit="props.unmountOnExit" :lazy-mount="props.lazyMount">
    <slot />
  </ArkDialog.Root>
</template>
