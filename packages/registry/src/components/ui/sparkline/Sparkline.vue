<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { sparkPath, SPARK_VIEWBOX } from '@/components/ui/sparkline/path'
import { cx } from '@/lib/cx'

const props = defineProps<{
  values: readonly number[]
  /* a shape reaches no screen reader, so the reading is carried in text beside it */
  label: string
  /* pass one to hold a column of them on a single scale */
  domain?: readonly [number, number]
  class?: HTMLAttributes['class']
}>()

const d = computed(() => sparkPath(props.values, props.domain))
</script>

<template>
  <span :class="cx('flex items-center', props.class)">
    <!-- an em height follows the text of the cell it sits in, so the mark tightens with the knob -->
    <svg
      class="h-[1.5em] w-full"
      :viewBox="SPARK_VIEWBOX"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <!-- the box is stretched to the cell, and only a non-scaling stroke survives that undistorted -->
      <path
        :d="d"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    <span class="sr-only">{{ props.label }}</span>
  </span>
</template>
