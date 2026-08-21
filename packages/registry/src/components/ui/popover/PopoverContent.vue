<script setup lang="ts">
import { Popover as ArkPopover } from '@ark-ui/vue/popover'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<!-- the positioner has no rank here: the stylesheet reaches ark's inline value -->
<template>
  <Teleport to="body">
    <ArkPopover.Positioner>
      <ArkPopover.Content
        :class="
          cx(
            'layer min-w-52 py-1 focus:outline-none data-[state=open]:animate-[rise_var(--dur-local)_var(--ease-beat)]',
            props.class,
          )
        "
      >
        <slot />
      </ArkPopover.Content>
    </ArkPopover.Positioner>
  </Teleport>
</template>
