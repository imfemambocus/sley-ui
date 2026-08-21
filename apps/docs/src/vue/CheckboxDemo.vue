<script setup lang="ts">
import { ref } from 'vue'
import Checkbox, { type CheckedState } from '@/components/ui/checkbox/Checkbox.vue'
import Demo from './Demo.vue'

const one = ref<CheckedState>(true)
const two = ref<CheckedState>(false)
</script>

<template>
  <Demo caption="The third box is fixed at indeterminate, which is the head state of a partly selected table.">
    <Checkbox v-model:checked="one">Keep the reads</Checkbox>
    <Checkbox v-model:checked="two">Notify the owner</Checkbox>
    <Checkbox checked="indeterminate" label="Some rows selected" />
  </Demo>
</template>
