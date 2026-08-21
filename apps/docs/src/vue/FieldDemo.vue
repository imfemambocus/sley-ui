<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Field from '@/components/ui/field/Field.vue'
import FieldError from '@/components/ui/field/FieldError.vue'
import FieldHint from '@/components/ui/field/FieldHint.vue'
import FieldInput from '@/components/ui/field/FieldInput.vue'
import FieldLabel from '@/components/ui/field/FieldLabel.vue'
import FieldSet from '@/components/ui/field/FieldSet.vue'
import FieldTextarea from '@/components/ui/field/FieldTextarea.vue'
import Demo from './Demo.vue'

const owner = ref('M. Haas')
const note = ref('')
</script>

<template>
  <Demo
    class="w-full max-w-md"
    caption="Empty the owner to see the error. In dense mode the hints go to screen readers only."
  >
    <FieldSet legend="Reassign the run" class="w-full">
      <Field required :invalid="owner.trim() === ''">
        <FieldLabel>New owner</FieldLabel>
        <FieldInput v-model="owner" />
        <FieldHint>The person who answers for the result.</FieldHint>
        <FieldError>Name the person who takes the run.</FieldError>
      </Field>

      <Field>
        <FieldLabel>Note</FieldLabel>
        <FieldTextarea v-model="note" />
        <FieldHint>The note goes on the run, and the current owner reads it.</FieldHint>
      </Field>

      <div class="flex justify-end">
        <Button variant="primary" :disabled="owner.trim() === ''">Save</Button>
      </div>
    </FieldSet>
  </Demo>
</template>
