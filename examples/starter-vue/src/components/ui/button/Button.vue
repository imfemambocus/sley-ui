<script lang="ts">
export type ButtonVariant = 'default' | 'primary' | 'danger' | 'quiet'
</script>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

/* everything else, `disabled` and the listeners included, reaches the button as an attribute */
const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    type?: 'button' | 'submit' | 'reset'
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'default', type: 'button' },
)

const VARIANT: Record<ButtonVariant, string> = {
  default: 'ctl',
  primary: 'border border-indigo bg-indigo text-ground hover:bg-indigo/90',
  danger: 'border border-madder bg-madder text-ground hover:bg-madder/90',
  quiet: 'text-weft-dim hover:text-weft',
}
</script>

<template>
  <button
    :type="props.type"
    :class="
      cx(
        'inline-flex h-(--ctl-h) cursor-pointer items-center justify-center gap-1.5 px-(--cell-x) transition-colors duration-(--dur-instant) ease-(--ease-beat) disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT[props.variant],
        props.class,
      )
    "
  >
    <slot />
  </button>
</template>
