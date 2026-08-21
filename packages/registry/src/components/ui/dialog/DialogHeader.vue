<script setup lang="ts">
import { Dialog as ArkDialog } from '@ark-ui/vue/dialog'
import type { HTMLAttributes } from 'vue'
import CloseIcon from '@/components/ui/icons/CloseIcon.vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <header :class="cx('reed-edge flex items-start justify-between gap-4 px-(--cell-x) py-(--stack)', props.class)">
    <div class="flex flex-col gap-1">
      <slot />
    </div>
    <ArkDialog.CloseTrigger
      aria-label="Close"
      class="-mr-1 cursor-pointer p-1 text-weft-faint transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft"
    >
      <CloseIcon class="size-3.5" />
    </ArkDialog.CloseTrigger>
  </header>
</template>
