<script setup lang="ts" generic="T extends string">
const props = defineProps<{
  legend: string
  options: readonly T[]
  value: T
}>()

const emit = defineEmits<{ select: [next: T] }>()
</script>

<template>
  <fieldset class="flex items-center border border-reed">
    <legend class="sr-only">{{ props.legend }}</legend>
    <button
      v-for="option in props.options"
      :key="option"
      type="button"
      :aria-pressed="option === props.value"
      class="h-(--ctl-h) cursor-pointer px-(--cell-x) text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft aria-pressed:bg-indigo-wash aria-pressed:text-weft"
      @click="emit('select', option)"
    >
      {{ option }}
    </button>
  </fieldset>
</template>
