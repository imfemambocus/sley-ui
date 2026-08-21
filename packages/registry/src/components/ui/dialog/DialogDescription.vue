<script setup lang="ts">
import { Dialog as ArkDialog } from '@ark-ui/vue/dialog'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <ArkDialog.Description :class="cx('text-weft-dim', props.class)">
    <slot />
  </ArkDialog.Description>
</template>
