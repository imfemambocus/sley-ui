<script setup lang="ts">
import { Dialog as ArkDialog } from '@ark-ui/vue/dialog'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<!-- ark names the dialog from its title, so every dialog carries one -->
<template>
  <Teleport to="body">
    <ArkDialog.Backdrop
      class="fixed inset-0 z-(--z-backdrop) bg-sunken/70 backdrop-blur-[2px] data-[state=open]:animate-[fade_var(--dur-overlay)_var(--ease-beat)] data-[state=closed]:animate-[fade-out_var(--dur-local)_var(--ease-exit)]"
    />
    <ArkDialog.Positioner class="fixed inset-0 z-(--z-modal) grid place-items-center p-6">
      <ArkDialog.Content
        :class="
          cx(
            'layer flex w-[min(480px,92vw)] flex-col data-[state=open]:animate-[rise_var(--dur-overlay)_var(--ease-beat)] data-[state=closed]:animate-[rise-out_var(--dur-local)_var(--ease-exit)]',
            props.class,
          )
        "
      >
        <slot />
      </ArkDialog.Content>
    </ArkDialog.Positioner>
  </Teleport>
</template>
