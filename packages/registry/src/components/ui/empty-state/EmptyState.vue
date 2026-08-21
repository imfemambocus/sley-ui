<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{
  title: string
  description?: string
  class?: HTMLAttributes['class']
}>()
</script>

<!-- the text sits on a patch of cloth. no warp runs behind it. -->
<template>
  <div
    :class="
      cx('reed-warp flex flex-col items-center justify-center gap-(--stack) p-(--cell-x) text-center', props.class)
    "
    :style="{ minHeight: 'calc(var(--row-h) * 4)' }"
  >
    <div class="flex flex-col gap-1 bg-raised px-(--cell-x)">
      <p class="text-weft-dim">{{ props.title }}</p>
      <p v-if="props.description" class="text-weft-faint">{{ props.description }}</p>
    </div>
    <slot name="action" />
  </div>
</template>
