<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const props = withDefaults(
  defineProps<{
    caption?: string
    /* a table or a console fills its frame; a control sits in the middle of one */
    bleed?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { bleed: false },
)
</script>

<template>
  <figure :class="['demo-frame', props.class]">
    <div :class="props.bleed ? undefined : 'demo-body'">
      <slot />
    </div>
    <figcaption v-if="props.caption" class="demo-caption">{{ props.caption }}</figcaption>
  </figure>
</template>
