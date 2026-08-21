<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ label: string }>()

const emit = defineEmits<{ resize: [next: number] }>()

const KEY_STEP = 8

const grip = ref<HTMLButtonElement | null>(null)
const originX = ref(0)
const originWidth = ref(0)
const dragging = ref(false)

/* the width on screen. a column that never moved holds no px of its own. */
const cellWidth = () => grip.value?.parentElement?.offsetWidth ?? 0

const onPointerDown = (event: PointerEvent) => {
  grip.value?.setPointerCapture(event.pointerId)
  originX.value = event.clientX
  originWidth.value = cellWidth()
  dragging.value = true
}

const onPointerMove = (event: PointerEvent) => {
  if (!dragging.value) return
  emit('resize', originWidth.value + event.clientX - originX.value)
}

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  const from = cellWidth()
  emit('resize', event.key === 'ArrowLeft' ? from - KEY_STEP : from + KEY_STEP)
}
</script>

<!-- a button: the keyboard reaches the width this way, and the capture needs no window listener -->
<template>
  <button
    ref="grip"
    type="button"
    :aria-label="`Resize the ${props.label} column`"
    class="reed-grip"
    :data-dragging="dragging ? '' : undefined"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @lostpointercapture="dragging = false"
    @keydown="onKeyDown"
  />
</template>
