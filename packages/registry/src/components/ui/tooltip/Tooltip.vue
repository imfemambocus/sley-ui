<script setup lang="ts">
import { Tooltip as ArkTooltip } from '@ark-ui/vue/tooltip'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

/* faster than the ark default, for an interface with many small questions */
const props = withDefaults(
  defineProps<{
    content?: string
    openDelay?: number
    closeDelay?: number
    class?: HTMLAttributes['class']
  }>(),
  { openDelay: 200, closeDelay: 80 },
)
</script>

<template>
  <ArkTooltip.Root :open-delay="props.openDelay" :close-delay="props.closeDelay">
    <!-- the trigger becomes whatever the caller put in the slot -->
    <ArkTooltip.Trigger as-child>
      <slot />
    </ArkTooltip.Trigger>
    <Teleport to="body">
      <ArkTooltip.Positioner>
        <ArkTooltip.Content
          :class="
            cx(
              'layer max-w-64 px-2 py-1 text-weft data-[state=open]:animate-[fade_var(--dur-instant)_var(--ease-beat)]',
              props.class,
            )
          "
        >
          <slot name="content">{{ props.content }}</slot>
        </ArkTooltip.Content>
      </ArkTooltip.Positioner>
    </Teleport>
  </ArkTooltip.Root>
</template>
