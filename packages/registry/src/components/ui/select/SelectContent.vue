<script setup lang="ts">
import { Select as ArkSelect } from '@ark-ui/vue/select'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<!-- rank comes from the stylesheet; ark sets it inline on the positioner -->
<template>
  <Teleport to="body">
    <ArkSelect.Positioner>
      <ArkSelect.Content :class="cx('layer min-w-42 py-1 focus:outline-none', props.class)">
        <slot />
      </ArkSelect.Content>
    </ArkSelect.Positioner>
  </Teleport>
</template>
